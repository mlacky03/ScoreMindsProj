import { GroupPrediction } from "src/domain/models/group-prediction.model";
import { BasePredictionEventDto } from "../prediction-event-dto/base-prediction-event.dto";
import { PredictionStatus } from "src/infrastucture/persistence/entities/group-prediction.entity";


export class FullPredictionDto{
    id:number;
    predictedHomeScore:number|null;
    predictedAwayScore:number|null;
    matchId:number;
    groupId:number;
    createdAt:Date;
    lastUserChange:Date;
    totalPoints:number;
    predictedEvents:BasePredictionEventDto[];
    winner:string;
    lastUpdatedById:number;
    status:PredictionStatus;
    createdById:number;

    constructor(p:GroupPrediction)
    {
        this.id=p.id!;
        this.predictedAwayScore=p.predictedAwayScore;
        this.predictedHomeScore=p.predictedHomeScore;
        this.matchId=p.matchId;
        this.groupId=p.groupId;
        this.createdAt=p.createdAt;
        this.totalPoints=p.totalPoints;
        this.predictedEvents=p.predictedEvents.map(pe=>new BasePredictionEventDto(pe));
        this.winner=p.winner;
        this.lastUpdatedById=p.lastUpdatedById;
        this.status=p.status;
        this.createdById=p.createdById;
    }
}