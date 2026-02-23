import { Component, EventEmitter, Input, Output} from "@angular/core";
import { PredictionAuditFullDto } from "../../feature/prediction-audit/data/prediction-audit-full.dto";
import { CommonModule, JsonPipe, KeyValuePipe } from "@angular/common";



@Component({
    selector: 'app-prediction-audit-card',
    standalone:true,
    imports: [CommonModule, JsonPipe,KeyValuePipe],
    templateUrl: './prediction-audit-card.component.html',
    styleUrls: ['./prediction-audit-card.component.scss']
})
export class PredictionAuditCardComponent {
    @Input({required:true}) predictionAudit!: PredictionAuditFullDto;
    @Input() currentUserId?: number;

     @Output() predictionUpdated = new EventEmitter<number>();

      handleClick(): void {
            if(this.predictionAudit.id) {
                this.predictionUpdated.emit(this.predictionAudit.id);
            }
        }

}   
