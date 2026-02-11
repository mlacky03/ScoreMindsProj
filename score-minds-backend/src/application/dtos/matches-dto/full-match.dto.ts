import { EventRecord } from "src/application/interfaces/event-record";
import { Match } from "src/domain/models/match.model";

export class FullMatchDto{
    id:number;
    externalId:number;
    awayTeamName:string;
    homeTeamName:string;
    awayTeamLogo:string;
    homeTeamLogo:string;
    startTime:Date;
    status:string;
    finalScoreHome: number|null;
    finalScoreAway: number|null;
    actualScorersIds: number[];
    actualAssistantsIds: number[];
    hometeamId: number;
    awayteamId: number;
    isComputed:boolean;
    events:EventRecord[]

    constructor(m:Match){
        this.id=m.id!;
        this.externalId=m.externalId;
        this.awayTeamName=m.awayTeamName;
        this.homeTeamName=m.homeTeamName;
        this.awayTeamLogo=m.awayTeamLogo;
        this.homeTeamLogo=m.homeTeamLogo;
        this.startTime=m.startTime;
        this.status=m.status;
        this.finalScoreHome=m.finalScoreHome;
        this.finalScoreAway=m.finalScoreAway;
        this.events=m.events;
        this.hometeamId=m.homeTeamId;
        this.awayteamId=m.awayTeamId;
        this.isComputed=m.isComputed;
    }
}