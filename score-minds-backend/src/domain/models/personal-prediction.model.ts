import { UpdatePredictionDto } from "src/application/dtos/personal-prediction-dto/update-prediction.dto";
import { WinnerOption } from "../enums/CreateOption";
import { Match } from "./match.model";
import { PredictionEvent } from "./prediction-event.model";
import { BasePrediction } from "./base-prediction.abstract.model";
import { PredictionStatus } from "src/infrastucture/persistence/entities/personal-prediction.entity";

export class PersonalPrediction extends BasePrediction{
    constructor(
        id: number | null,
        matchId: number,
        predictedHomeScore: number | null,
        predictedAwayScore: number | null,
        winner: WinnerOption,
        pointsWon: number = 0,
        createdAt: Date = new Date(),
        updatedAt: Date | null = null,
        predictedEvents: PredictionEvent[] = [],
        match:Match|null,
        private _userId: number,
        private _status:PredictionStatus,     
    ) {
        super(id,matchId,predictedHomeScore,predictedAwayScore,winner,pointsWon,createdAt,updatedAt,predictedEvents,match);
    }

    updateStatus(status: PredictionStatus) {
        this._status = status;
    }


    
    get userId() { return this._userId; }
    get status() { return this._status; }
  
}