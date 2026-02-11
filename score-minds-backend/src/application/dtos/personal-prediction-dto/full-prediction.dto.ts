import { BasePredictionEventDto } from "../prediction-event-dto/base-prediction-event.dto";
import { FullPredictionEventDto } from "../prediction-event-dto/full-prediction-event.dto";
import { PersonalPrediction } from "src/domain/models/personal-prediction.model";

export class FullPredictionDto{
    id:number;
    predictedHomeScore:number|null;
    predictedAwayScore:number|null;
    matchId:number;
    userId:number;
    createdAt:Date;
    lastUserChange:Date;
    totalPoints:number;
    predictedEvents:BasePredictionEventDto[];
    winner:string;
    status:string;
    constructor(p:PersonalPrediction)
    {
        this.id=p.id!;
        this.predictedAwayScore=p.predictedAwayScore;
        this.predictedHomeScore=p.predictedHomeScore;
        this.matchId=p.matchId;
        this.userId=p.userId;
        this.createdAt=p.createdAt;
        this.totalPoints=p.pointsWon;
        this.predictedEvents=p.predictedEvents.map(pe=>new BasePredictionEventDto(pe));
        this.winner=p.winner;
        this.status=p.status
    }
}