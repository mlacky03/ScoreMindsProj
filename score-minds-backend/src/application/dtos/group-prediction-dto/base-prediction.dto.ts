import { PredictionStatus } from "src/infrastucture/persistence/entities/group-prediction.entity";
import { BasePredictionEventDto } from "../prediction-event-dto/base-prediction-event.dto";
import { GroupPrediction } from "src/domain/models/group-prediction.model";

export class BasePredictionDto{
    id:number;
    predictedHomeScore:number | null;
    predictedAwayScore:number | null;
    matchId:number;
    totalPoints:number;
    winner:string;
    predictionEvents:BasePredictionEventDto[];
    status:PredictionStatus;
    constructor(p:GroupPrediction)
    {

        this.id=p.id!;
        this.predictedHomeScore=p.predictedHomeScore;
        this.predictedAwayScore=p.predictedAwayScore;
        this.matchId=p.matchId;
        this.totalPoints=p.totalPoints;
        this.winner=p.winner;
        this.predictionEvents=p.predictedEvents?.map(event => new BasePredictionEventDto(event)) || [];
        this.status=p.status;
    }
}
