import { FullPredictionDto } from "./full-prediction.dto";
import { Prediction } from "../prediction.entity";
import { Match } from "src/modules/matches/matches.entity";

export class BasePredictionDto{
    id:number;
    predictedHomeScore:number;
    predictedAwayScore:number;
    matchId:number;
    totalPoints:number;
    winner:string;
    constructor(p:Prediction)
    {

        this.id=p.id;
        this.predictedHomeScore=p.predictedHomeScore;
        this.predictedAwayScore=p.predictedAwayScore;
        this.matchId=p.match.id;
        this.totalPoints=p.totalPoints;
        this.winner=p.winner;
    }
}
