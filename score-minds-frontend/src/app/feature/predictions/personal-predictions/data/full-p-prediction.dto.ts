import { PredictionEventBaseDto } from "./prediction-event/prediction-event-base.dto";

export interface FullUserPredictionDto{
    id:number;
    predictedHomeScore:number|null;
    predictedAwayScore:number|null;
    matchId:number;
    userId:number;
    createdAt:Date;
    lastUserChange:Date;
    totalPoints:number;
    predictedEvents:PredictionEventBaseDto[];
    winner:string;
}