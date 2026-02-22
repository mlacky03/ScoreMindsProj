import { Component, EventEmitter, input, Input, Output, signal } from "@angular/core";
import { BaseUserPredictionDto } from "../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { MatchBaseDto } from "../../feature/match/data/match-base.dto";
import { NgForm } from "@angular/forms";
import { NgFor, NgIf } from "@angular/common";
import { PredictionCardComponent } from "../prediction-card/prediction-card.component";

@Component({
    selector: 'app-prediction-list',
    imports: [NgIf, NgFor, PredictionCardComponent],
    templateUrl: './predicton-list.component.html',
    styleUrls: ['./predicton-list.component.scss']
})
export class PredictionListComponent {
    //@Input({ required: true }) predictions: BaseUserPredictionDto[] = [];
    @Input({ required: true }) matches: MatchBaseDto[] = [];
    @Input() mode: 'grid' | 'sidebar' = 'grid';

    @Output() predictionSelected = new EventEmitter<{ predictionId: number, matchId: number }>();

    onPredictionSelected(predictionId: number, matchId: number): void {
        this.predictionSelected.emit({ predictionId, matchId });
    }
    getMatch(matchId: number) {
        return this.matches.find(m => m.id === matchId);


    }
    predictions = input.required<BaseUserPredictionDto[]>();
    
}
