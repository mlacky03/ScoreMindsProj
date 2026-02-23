import { Component, Input } from "@angular/core";
import { PredictionAuditFullDto } from "../../feature/prediction-audit/data/prediction-audit-full.dto";
import { NgFor, NgIf } from "@angular/common";
import { PredictionAuditCardComponent } from "../prediction-audit-card/prediction-audit-card.component";

@Component({
    selector:'app-prediction-audit-list',
    imports: [PredictionAuditCardComponent, NgFor,NgIf],
    templateUrl:'./prediction-audit-list.component.html',
    styleUrl:'./prediction-audit-list.component.scss'
})
export class PredictionAuditListComponent {
    @Input({required:true}) predictionAuditList!: PredictionAuditFullDto[];
    @Input() currentUserId?: number;

    trackByAudit(index: number, audit: PredictionAuditFullDto): number {
        return audit.id;
    }

}