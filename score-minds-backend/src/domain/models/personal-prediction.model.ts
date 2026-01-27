import { UpdatePredictionDto } from "src/application/dtos/personal-prediction-dto/update-prediction.dto";
import { WinnerOption } from "../enums/CreateOption";
import { Match } from "./match.model";
import { PredictionEvent } from "./prediction-event.model";
import { BasePrediction } from "./base-prediction.abstract.model";

export class PersonalPrediction extends BasePrediction{
    constructor(
        id: number | null,
        matchId: number,
        predictedHomeScore: number | null,
        predictedAwayScore: number | null,
        winner: WinnerOption,
        totalPoints: number = 0,
        createdAt: Date = new Date(),
        updatedAt: Date | null = null,
        predictedEvents: PredictionEvent[] = [],
        match:Match|null,
        private _userId: number,     
    ) {
        super(id,matchId,predictedHomeScore,predictedAwayScore,winner,totalPoints,createdAt,updatedAt,predictedEvents,match);
    }




    
    get userId() { return this._userId; }
  
}