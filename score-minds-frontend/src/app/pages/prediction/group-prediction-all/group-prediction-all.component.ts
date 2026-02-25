import { Component, inject, signal } from "@angular/core";
import { PredictionListComponent } from "../../../components/prediction-list/predicton-list.component";
import { PredictionViewComponent } from "../../../components/prediction-view/prediction-view.component";
import { CommonModule, NgIf } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { BaseUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { MatchBaseDto } from "../../../feature/match/data/match-base.dto";
import { filter, finalize, forkJoin, of, Subscription, switchMap, tap } from "rxjs";
import { MatchService } from "../../../feature/match/match.service";
import { SocketService } from "../../../core/services/socket.service";
import { GroupPredictionService } from "../../../feature/predictions/group-predictions/group-prediction.service";
import { BaseGroupPredictionDto } from "../../../feature/predictions/group-predictions/data/base-g-predicton.dto";
import { GroupBaseDto } from "../../../feature/groups/data/group-base.dto";
import { GroupService } from "../../../feature/groups/group.service";
import { FullGroupPredictionDto } from "../../../feature/predictions/group-predictions/data/full-g-predicton.dto";


@Component({
    selector: 'app-group-prediction-all',
    standalone: true,
    imports: [PredictionListComponent, PredictionViewComponent, NgIf, RouterOutlet, CommonModule],
    templateUrl: './group-prediction-all.component.html',
    styleUrls: ['./group-prediction-all.component.scss']
})
export class PredictionAllComponent {
    private predictionService = inject(GroupPredictionService);
    private matchService = inject(MatchService);
    private groupService = inject(GroupService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private updateSub = new Subscription();
    private socketService = inject(SocketService);

    predictions = signal<BaseGroupPredictionDto[]>([]);
    matches = signal<MatchBaseDto[]>([]);
    selectedPredictionId = signal<number | null>(null);
    groups = signal<GroupBaseDto[]>([])
    selectedGroupId = signal<number | null>(null);

    loading = signal(true);
    isDetailsOpen = signal(false);

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            const hasChild = this.route.children.length > 0;
            this.isDetailsOpen.set(hasChild);
        });
        const routerState = this.router.getCurrentNavigation()?.extras.state;
        if (routerState && routerState['passedGroupId']) {
            this.selectedGroupId.set(routerState['passedGroupId']);
        }
    }

    ngOnInit() {
        this.updateSub.add(
            this.socketService.onMatchListUpdate().subscribe((data: { id: number, status: string }) => {
                console.log('Stigao update statusa meča u listu predikcija:', data);

                this.matches.update((currentMatches) => {
                    return currentMatches.map(match => {
                        if (match.id === data.id) {
                            return { ...match, status: data.status };
                        }
                        return match;
                    });
                });
            })
        );
         this.updateSub.add(
            this.socketService.onPredictionListUpdate().subscribe((data: any) => {
                console.log('Stigao update statusa meča u listu predikcija:', data);

                this.predictions.update((currentPredictions) => {
                    const index = currentPredictions.findIndex(p => p.id === data.id);
                    if (index !== -1) {
                        return currentPredictions.map(prediction =>
                            prediction.id === data.id ? { ...prediction, ...data} : prediction
                        );
                    } else {
                        this.matches.update((currentMatches) => {
                            const index= currentMatches.findIndex(m=>m.id === data.matchId);
                            if (index !== -1) {
                                return currentMatches;
                            }
                            return [data.match,...currentMatches]
                        });
                        const p: BaseGroupPredictionDto = {
                            id: data.id,
                            matchId: data.matchId,
                            predictedHomeScore: data.predictedHomeScore,
                            predictedAwayScore: data.predictedAwayScore,
                            totalPoints: data.totalPoints,
                            winner: data.winner,
                            predictionEvents: data.predictionEvents,
                            status: data.status
                        };
                        return [p, ...currentPredictions];
                    }
                });
            })
        );
       

        this.socketService.joinRoom('all_matches_list');




        this.updateSub.add(
            this.predictionService.predictionUpdated$.subscribe((updatedPrediction) => {
                this.predictions.update((currentList) => {
                    return currentList.map((item) => {
                        if (item.id === updatedPrediction.id) {
                            return { ...item, ...updatedPrediction };
                        }
                        return item;
                    });
                });
            })
        );
        this.updateSub.add(
            this.predictionService.predictionDeleted$.subscribe((deletedId) => {
                this.predictions.update((currentList) =>
                    currentList.filter(item => item.id !== deletedId)
                );
            })
        );
        this.loading.set(true);
        this.groupService.searchGroups().subscribe({
            next: (groups) => {
                this.groups.set(groups);

                if (groups.length > 0) {

                    const defaultGroupId = groups[0].id;
                    if (this.selectedGroupId() === null) {
                        this.selectedGroupId.set(defaultGroupId);
                    }

                    this.socketService.joinRoom(`all_predictions_list_${defaultGroupId}`);
                    this.loadDataForGroup(this.selectedGroupId()!);
                } else {

                    this.loading.set(false);
                }
            },
            error: (err) => {
                console.error('Greška pri učitavanju grupa', err);
                this.loading.set(false);
            }
        });
        

    }
    
    onGroupChange(newGroupIdStr: string | number) {
        const newGroupId = Number(newGroupIdStr);


        if (this.selectedGroupId() === newGroupId) {
            return;
        }
        this.socketService.leaveRoom(`all_predictions_list_${this.selectedGroupId()}`);


        this.selectedGroupId.set(newGroupId);
        this.socketService.joinRoom(`all_predictions_list_${this.selectedGroupId()}`);

        this.predictions.set([]);
        this.matches.set([]);


        this.loadDataForGroup(newGroupId);
    }


    loadDataForGroup(groupId: number) {
        this.loading.set(true);


        this.predictionService.getAllPrediction(groupId)
            .pipe(
                tap((predictions) => {
                    this.predictions.set(predictions);
                }),
                switchMap((predictions) => {
                    const allMatchIds = predictions.map(p => p.matchId);

                    if (allMatchIds.length === 0) {
                        return of([]);
                    }


                    return this.matchService.getMatchesByIds(allMatchIds);
                }),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (matches) => {
                    this.matches.set(matches as MatchBaseDto[]);
                },
                error: (error) => {
                    console.error('Error loading group data:', error);
                }
            });
    }

    onActivate() {
        this.isDetailsOpen.set(true);
    }


    onDeactivate() {
        this.isDetailsOpen.set(false);
    }
    onSelect(predictionId: number, matchId: number) {
        if (!predictionId || this.selectedPredictionId() === predictionId) {
            return;
        }
        
        this.router.navigate([predictionId], {
            relativeTo: this.route,
            queryParams: { groupId: this.selectedGroupId() }
        });
    }

    getSelectedGroupId(): number | undefined {
        return this.selectedGroupId() || undefined;
    }

    ngOnDestroy() {
        if (this.updateSub) {
            this.updateSub.unsubscribe();
        }
        this.socketService.leaveRoom('all_matches_list');
        this.socketService.leaveRoom(`all_predictions_list_${this.selectedGroupId()}`);
    }

}