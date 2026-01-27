import { UpdatePredictionDto } from "src/application/dtos/personal-prediction-dto/update-prediction.dto";
import { WinnerOption } from "../enums/CreateOption";
import { Match } from "./match.model";
import { PredictionEvent } from "./prediction-event.model";
import { BasePrediction } from "./base-prediction.abstract.model";
import { PredictionStatus } from "src/infrastucture/persistence/entities/group-prediction.entity";

export class GroupPrediction extends BasePrediction{
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

        private _groupId: number,  
        private _status: PredictionStatus,
        private _createdById: number,
        private _lastUpdatedById: number  
    ) {
        super(id,matchId,predictedHomeScore,predictedAwayScore,winner,totalPoints,createdAt,updatedAt,predictedEvents,match);
    }




    
    get groupId() { return this._groupId; }   
    get status() { return this._status; }   
    get createdById() { return this._createdById; }   
    get lastUpdatedById() { return this._lastUpdatedById; }   
}