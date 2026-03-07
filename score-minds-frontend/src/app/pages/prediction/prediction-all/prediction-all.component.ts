import { Component, effect, inject, signal } from "@angular/core";
import { PredictionListComponent } from "../../../components/prediction-list/predicton-list.component";
import { PredictionViewComponent } from "../../../components/prediction-view/prediction-view.component";
import { CommonModule, NgIf } from "@angular/common";
import { PersonalPredictionService } from "../../../feature/predictions/personal-predictions/personal-predictions.service";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { BaseUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { MatchBaseDto } from "../../../feature/match/data/match-base.dto";
import { filter, finalize, forkJoin, of, Subscription, switchMap, tap } from "rxjs";
import { MatchService } from "../../../feature/match/match.service";
import { SocketService } from "../../../core/services/socket.service";
import { AuthService } from "../../../core/auth/auth.service";


@Component({
    selector: 'app-prediction-all',
    standalone: true,
    imports: [PredictionListComponent, NgIf, RouterOutlet, CommonModule],
    templateUrl: './prediction-all.component.html',
    styleUrls: ['./prediction-all.component.scss']
})
export class PredictionAllComponent {
    private predictionService = inject(PersonalPredictionService);
    private matchService = inject(MatchService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private updateSub = new Subscription();
    private socketService = inject(SocketService);
    private authService = inject(AuthService);
    private activeMatchRooms: number[] = [];

    predictions = signal<BaseUserPredictionDto[]>([]);
    matches = signal<MatchBaseDto[]>([]);
    selectedPredictionId = signal<number | null>(null);

    page = signal<number>(1);
    pageSize = signal<number>(8);
    totalItems = signal<number>(0);
    filterMode = signal<'upcoming' | 'history'>('upcoming');

    currenUser = this.authService.currentUser;
    loading = signal(true);
    isDetailsOpen = signal(false);

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            const hasChild = this.route.children.length > 0;
            this.isDetailsOpen.set(hasChild);
        });
        effect(() => {
            const currentMode = this.filterMode();

            this.fetchData(this.page(), currentMode);

        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.updateSub.add(
            this.socketService.onMatchUpdate().subscribe((updateData) => {
                console.log('Stigao update statusa meča u listu predikcija:', updateData);
                if (this.filterMode() === 'upcoming') {
                    if (updateData.status === 'FT') {
                        this.matches.update((currentMatches) => {
                            return currentMatches.filter(match => match.id !== updateData.id);
                        });
                        if (this.matches().length < this.pageSize()) {
                            this.fetchData(this.page(), this.filterMode());
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

                }
            })
        );

        this.updateSub.add(
            this.socketService.onPersonalListUpdate().subscribe((data) => {
                console.log('Stigao update personalne liste predikcija:', data);
                this.predictions.update((cp) => {
                    return cp.map((item) => {
                        if (item.id === data.predictionId) {
                            return { ...item, status: data.status, totalPoints: data.points };
                        }
                        return item;
                    });
                });
            })
        );



        this.socketService.joinRoom('personal_list_changed_' + this.currenUser()?.id);


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
    private fetchData(page: number, mode: 'upcoming' | 'history') {
        this.loading.set(true);


        this.predictionService.getAllPredictions(page, this.pageSize(), mode)
            .pipe(
                tap((response) => {
                    this.predictions.set(response.data);
                    this.totalItems.set(response.total);
                }),
                switchMap((response) => {
                    const allMatchIds = response.data.map((p: any) => p.matchId);
                    return allMatchIds.length > 0
                        ? this.matchService.getMatchesByIds(allMatchIds)
                        : of([]);
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
                    if (mode === 'upcoming') {
                        const newMatchIds = matches.map((m: any) => m.id);
                        this.socketService.joinMatchRooms(newMatchIds);
                        this.activeMatchRooms = newMatchIds;
                    }
                },
                error: (err) => console.error(err)
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
        this.router.navigate([predictionId], { relativeTo: this.route });
    }
    changePage(step: number) {
        const newPage = this.page() + step;


        if (newPage > 0) {
            this.page.set(newPage);
        }
    }

    ngOnDestroy() {
        if (this.updateSub) {
            this.updateSub.unsubscribe();
        }
        if (this.activeMatchRooms.length > 0) {
            this.socketService.leaveMatchRooms(this.activeMatchRooms);
        }
        this.socketService.leaveRoom('personal_list_changed_' + this.currenUser()?.id);
    }

}