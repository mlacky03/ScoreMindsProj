import { PredictionEventBaseDto } from "../../personal-predictions/data/prediction-event/prediction-event-base.dto";

export interface FullGroupPredictionDto {
    id:number;
    predictedHomeScore:number|null;
    predictedAwayScore:number|null;
    matchId:number;
    groupId:number;
    createdAt:Date;
    lastUserChange:Date;
    totalPoints:number;
    predictedEvents:PredictionEventBaseDto[];
    winner:string;
    lastUpdatedById:number;
    status:string;
    createdById:number;
    createdByName:string;
}