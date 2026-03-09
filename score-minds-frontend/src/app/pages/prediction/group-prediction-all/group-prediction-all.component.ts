import { Component, effect, inject, signal, untracked } from "@angular/core";
import { PredictionListComponent } from "../../../components/prediction-list/predicton-list.component";
import { PredictionViewComponent } from "../../../components/prediction-view/prediction-view.component";
import { CommonModule, NgIf } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { MatchBaseDto } from "../../../feature/match/data/match-base.dto";
import { filter, finalize, forkJoin, of, Subscription, switchMap, tap } from "rxjs";
import { MatchService } from "../../../feature/match/match.service";
import { SocketService } from "../../../core/services/socket.service";
import { GroupPredictionService } from "../../../feature/predictions/group-predictions/group-prediction.service";
import { BaseGroupPredictionDto } from "../../../feature/predictions/group-predictions/data/base-g-predicton.dto";
import { GroupBaseDto } from "../../../feature/groups/data/group-base.dto";
import { GroupService } from "../../../feature/groups/group.service";


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
    private activeMatchRooms: number[] = [];

    predictions = signal<BaseGroupPredictionDto[]>([]);
    matches = signal<MatchBaseDto[]>([]);
    selectedPredictionId = signal<number | null>(null);
    groups = signal<GroupBaseDto[]>([])
    selectedGroupId = signal<number | null>(null);

    page = signal<number>(1);
    pageSize = signal<number>(8);
    totalItems = signal<number>(0);
    filterMode = signal<'upcoming' | 'history'>('upcoming');

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
        effect(() => {
            const groupId = this.selectedGroupId();
            const mode = this.filterMode();

            if (groupId !== null) {
                untracked(() => {
                    this.loadDataForGroup(groupId);
                });
            }


        }, { allowSignalWrites: true });
        effect((onCleanup) => {
            const groupId = this.selectedGroupId();
            const mode = this.filterMode();


            if (groupId !== null && mode === 'upcoming') {
                const roomName = `all_predictions_list_${groupId}`;
                this.socketService.joinRoom(roomName);

                onCleanup(() => {
                    this.socketService.leaveRoom(roomName);
                });
            }
        });
    }

    ngOnInit() {
        this.fetchData();
        this.updateSub.add(
            this.socketService.onMatchUpdate().subscribe((updateData) => {
                if (this.filterMode() !== 'upcoming') return;
                console.log('Stigao update statusa meča u listu predikcija:', updateData);
                if (updateData.status === 'FT') {

                    this.matches.update((currentMatches) => {
                        return currentMatches.filter(match => match.id !== updateData.id);
                    });
                    this.predictions.update((currentPredictions) => {
                        return currentPredictions.filter(prediction => prediction.matchId !== updateData.id);
                    });

                    this.totalItems.update(t => t > 0 ? t - 1 : 0);

                    if (this.totalItems() >= this.page() * this.pageSize()) {
                        this.loadDataForGroup(this.selectedGroupId()!);
                    }

                }
                else {
                    this.matches.update((currentMatches) => {
                        return currentMatches.map(match => {
                            if (match.id === updateData.id) {
                                return { ...match, ...updateData };
                            }
                            return match;
                        });
                    });
                }

            })
        );
        this.updateSub.add(
            this.socketService.onPredictionListUpdate().subscribe((data: any) => {
                console.log('Stigao update predikcije u listu predikcija:', data);
                this.predictions.update((currentPredictions) => {
                    const index = currentPredictions.findIndex(p => p.id === data.id);
                    if (index !== -1) {
                        return currentPredictions.map(prediction =>
                            prediction.id === data.id ? { ...prediction, ...data } : prediction
                        );
                    } else {
                        this.matches.update((currentMatches) => {
                            const noviMec = data.match;
                            const index = currentMatches.findIndex(m => m.id === data.matchId);
                            if (index !== -1) {
                                return currentMatches;
                            }
                            const mapiranMec: MatchBaseDto = {
                                id: noviMec._id,
                                externalId: noviMec._externalId,
                                homeTeamName: noviMec._homeTeamName,
                                awayTeamName: noviMec._awayTeamName,
                                awayTeamLogo: noviMec._awayTeamLogo,
                                homeTeamLogo: noviMec._homeTeamLogo,
                                startTime: noviMec._startTime,
                                status: noviMec._status,
                                finalScoreHome: noviMec._finalScoreHome,
                                finalScoreAway: noviMec._finalScoreAway,
                                minutes: noviMec._minutes
                            };
                            const updatedMatches = [mapiranMec, ...currentMatches];

                            this.activeMatchRooms.push(data.matchId);
                            this.socketService.joinRoom('match_' + data.matchId);
                            if (updatedMatches.length > this.pageSize()) {

                                const discardedMatch = updatedMatches[this.pageSize()];

                                this.socketService.leaveRoom('match_' + discardedMatch.id);

                                this.activeMatchRooms = this.activeMatchRooms.filter(id => id !== discardedMatch.id);
                            }


                            return updatedMatches.slice(0, this.pageSize());
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
                        return [p, ...currentPredictions].slice(0, this.pageSize());
                    }
                });
            })
        );





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



    }

    fetchData() {
        this.loading.set(true);
        this.groupService.searchGroups().subscribe({
            next: (groups) => {
                this.groups.set(groups);

                if (groups.length > 0) {

                    const defaultGroupId = groups[0].id;
                    if (this.selectedGroupId() === null) {
                        this.selectedGroupId.set(defaultGroupId);

                    }
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
        this.predictions.set([]);
        this.matches.set([]);

        this.page.set(1);

        this.selectedGroupId.set(newGroupId)
    }

    loadDataForGroup(groupId: number) {
        this.loading.set(true);


        this.predictionService.getAllPrediction(groupId, this.page(), this.pageSize(), this.filterMode())
            .pipe(
                tap((predictions) => {
                    this.predictions.set(predictions.data);
                    this.totalItems.set(predictions.total);
                }),
                switchMap((predictions) => {
                    const allMatchIds = predictions.data.map(p => p.matchId);

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
                    if (this.activeMatchRooms.length > 0) {
                        this.socketService.leaveMatchRooms(this.activeMatchRooms);
                        this.activeMatchRooms = [];
                    }
                    if (this.filterMode() === 'upcoming') {
                        const newMatchIds = matches.map((m: any) => m.id);
                        this.socketService.joinMatchRooms(newMatchIds);
                        this.activeMatchRooms = newMatchIds;
                    }
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
        if (this.activeMatchRooms.length > 0) {
            this.socketService.leaveMatchRooms(this.activeMatchRooms);
        }
    }

}

