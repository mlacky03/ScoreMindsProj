import { PersonalPrediction } from "src/domain/models/personal-prediction.model";
import { BasePredictionEventDto } from "../prediction-event-dto/base-prediction-event.dto";

export class BasePredictionDto{
    id:number;
    predictedHomeScore:number | null;
    predictedAwayScore:number | null;
    matchId:number;
    totalPoints:number;
    winner:string;
    predictionEvents:BasePredictionEventDto[];
    constructor(p:PersonalPrediction)
    {

        this.id=p.id!;
        this.predictedHomeScore=p.predictedHomeScore;
        this.predictedAwayScore=p.predictedAwayScore;
        this.matchId=p.matchId;
        this.totalPoints=p.totalPoints;
        this.winner=p.winner;
        this.predictionEvents=p.predictedEvents?.map(event => new BasePredictionEventDto(event)) || [];
    }
}
