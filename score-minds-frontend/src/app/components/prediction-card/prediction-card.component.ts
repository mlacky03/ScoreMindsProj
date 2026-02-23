import { Component, EventEmitter, inject, Input, input, Output } from "@angular/core";
import { FullUserPredictionDto } from "../../feature/predictions/personal-predictions/data/full-p-prediction.dto";
import { BaseUserPredictionDto } from "../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { DatePipe, NgClass, NgIf } from "@angular/common";
import { MatchBaseDto } from "../../feature/match/data/match-base.dto";
import { ActivatedRoute, Router } from "@angular/router";


@Component({
    selector: 'app-prediction-card',
    standalone: true,
    imports: [NgIf,NgClass,DatePipe],
    templateUrl: './prediction-card.component.html',
    styleUrls: ['./prediction-card.component.scss']
})
export class PredictionCardComponent {
        @Input() prediction!: BaseUserPredictionDto;
        @Input() match!:MatchBaseDto;
        @Input() compact = false;
        @Input() currentUserId?: number;
        @Input() personal = false;
        @Input() currentGroupId?: number;

        @Output() predictionUpdated = new EventEmitter<{predictionId: number, matchId: number}>();

        private router = inject(Router);
        private route = inject(ActivatedRoute);
        
        handleClick(): void {
            if(this.prediction.id) {
                this.predictionUpdated.emit({predictionId: this.prediction.id, matchId: this.match.id});
            }
        }
        onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.src = '';
    img.classList.add('img-fallback');
 }

 onViewPrediction(){
    if(this.prediction.id && this.personal){
        this.router.navigate([this.prediction.id], { relativeTo: this.route });
    }
    else if(this.prediction.id)
    {
        this.router.navigate([this.prediction.id], {
            relativeTo: this.route,
            queryParams: { groupId: this.currentGroupId }
        });
    }

 }
 onSeeAudit(){
    if(this.prediction.id){
        this.router.navigate(["prediction-audit",this.prediction.id])
    }
 }
}
