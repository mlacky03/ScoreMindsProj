import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf,NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map, distinctUntilChanged, switchMap, filter, finalize} from 'rxjs/operators';
import { MatchListComponent } from '../../components/match-list/match-list.component';


import { CommonModule } from '@angular/common';
import { MatchViewComponent } from '../../components/match-view/match-view.component';
import { PredictionAuditService } from '../../feature/prediction-audit/prediction-audit.service';
import { PredictionAuditFullDto } from '../../feature/prediction-audit/data/prediction-audit-full.dto';
import { Subscription } from 'rxjs';
import { PredictionAuditListComponent } from '../../components/prediction-audit-list/prediction-audit-list.component';



@Component({
    selector: 'app-prediction-audit',
    standalone: true,
    imports: [PredictionAuditListComponent,NgIf,NgClass,CommonModule,MatchViewComponent],
    templateUrl: './prediction-audit.component.html',
    styleUrl: './prediction-audit.component.scss'
})
export class PredictionAuditComponent implements OnInit, OnDestroy {
    private predictionAuditService = inject(PredictionAuditService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    private predictionId = signal<number|null>(null);
    loading = signal<boolean>(true);
    predictionAuditList = signal<PredictionAuditFullDto[]>([]);
    
    private sub=new Subscription();
    ngOnInit(): void {
        this.sub.add(
            this.route.paramMap.pipe(
                map(params => params.get('predictionId')),
                map(id => id ? Number(id) : null),
                filter(id => id !== null && !isNaN(id)),
                distinctUntilChanged(),
                switchMap(predictionId => {
                    this.predictionId.set(predictionId!)
                    this.loading.set(true);
                    return this.predictionAuditService.GetByPrediciton(predictionId!).pipe(
                        finalize(() => this.loading.set(false)) 
                    );
                })
            ).subscribe({
                next: (audits) => {
                    this.predictionAuditList.set(audits);
                },
                error: (err) => {
                    console.error('Greška pri dohvatanju audita:', err);
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}