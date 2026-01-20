import { Prediction } from "../prediction.entity";

export class FullPredictionDto{
    id:number;
    predictedHomeScore:number;
    predictedAwayScore:number;
    matchId:number;
    userId:number;
    createdAt:Date;
    lastUserChange:Date;
    totalPoints:number;
    predictedEvents:number[];
    winner:string;
    constructor(p:Prediction)
    {
        this.id=p.id;
        this.predictedAwayScore=p.predictedAwayScore;
        this.predictedHomeScore=p.predictedHomeScore;
        this.matchId=p.match.id;
        this.userId=p.user.id;
        this.createdAt=p.createdAt;
        this.totalPoints=p.totalPoints;
        this.predictedEvents=p.predictedEvents.map(pe=>pe.id);
        this.winner=p.winner;
    }
}