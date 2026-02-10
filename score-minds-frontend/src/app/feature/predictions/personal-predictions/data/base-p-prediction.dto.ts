import { PredictionEventBaseDto } from "./prediction-event/prediction-event-base.dto";

export interface BaseUserPredictionDto
{
    id:number;
    predictedAwayScore:number|null;
    predictedHomeScore:number | null;
    matchId:number;
    totalPoints:number;
    winner:string;
    predictionEvents:PredictionEventBaseDto[];
}