import { Component, inject, signal } from "@angular/core";
import { PredictionListComponent } from "../../../components/prediction-list/predicton-list.component";
import { PredictionViewComponent } from "../../../components/prediction-view/prediction-view.component";
import { CommonModule, NgIf } from "@angular/common";
import { PersonalPredictionService } from "../../../feature/predictions/personal-predictions/personal-predictions.service";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { BaseUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { MatchBaseDto } from "../../../feature/match/data/match-base.dto";
import { filter, finalize, forkJoin, of, Subscription, switchMap, tap } from "rxjs";
import { MatchService } from "../../../feature/match/match.service";


@Component({
    selector: 'app-prediction-all',
    standalone: true,
    imports: [PredictionListComponent, PredictionViewComponent, NgIf, RouterOutlet, CommonModule],
    templateUrl: './prediction-all.component.html',
    styleUrls: ['./prediction-all.component.scss']
})
export class PredictionAllComponent {
    private predictionService = inject(PersonalPredictionService);
    private matchService = inject(MatchService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private updateSub!: Subscription;

    predictions = signal<BaseUserPredictionDto[]>([]);
    matches = signal<MatchBaseDto[]>([]);
    selectedPredictionId = signal<number | null>(null);

    loading = signal(true);
    isDetailsOpen = signal(false);

    constructor() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            const hasChild = this.route.children.length > 0;
            this.isDetailsOpen.set(hasChild);
        });
    }

    ngOnInit() {
        this.updateSub = this.predictionService.predictionUpdated$.subscribe((updatedPrediction) => {
            this.predictions.update((currentList) => {
                return currentList.map((item) => {
                    if (item.id === updatedPrediction.id) {
                        return { ...item, ...updatedPrediction };
                    }
                    return item;
                });
            });
        });
        this.predictionService.getAllPredictions()
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
                    console.error('Error loading data:', error);
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
        this.router.navigate([predictionId], { relativeTo: this.route });
    }

    ngOnDestroy() {
        if (this.updateSub) {
            this.updateSub.unsubscribe();
        }
    }

}