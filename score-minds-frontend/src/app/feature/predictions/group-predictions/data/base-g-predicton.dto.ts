import { PredictionEventBaseDto } from "../../personal-predictions/data/prediction-event/prediction-event-base.dto";

export interface BaseGroupPredictionDto {
    id:number;
    predictedHomeScore:number | null;
    predictedAwayScore:number | null;
    matchId:number;
    totalPoints:number;
    winner:string;
    predictionEvents:PredictionEventBaseDto[];
    status:string;
}