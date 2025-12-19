import { Match } from "../matches.entity";

export class FullMatchDto{
    id:number;
    externalId:number;
    awayTeamName:string;
    homeTeamName:string;
    awayTeamLogo:string;
    homeTeamLogo:string;
    startTime:Date;
    status:string;
    finalScoreHome: number;
    finalScoreAway: number;
    actualScorersIds: string[];
    actualAssistantsIds: string[];

    constructor(m:Match){
        this.id=m.id;
        this.externalId=m.externalId;
        this.awayTeamName=m.awayTeamName;
        this.homeTeamName=m.homeTeamName;
        this.awayTeamLogo=m.awayTeamLogo;
        this.homeTeamLogo=m.homeTeamLogo;
        this.startTime=m.startTime;
        this.status=m.status;
        this.finalScoreHome=m.finalScoreHome;
        this.finalScoreAway=m.finalScoreAway;
        this.actualScorersIds=m.actualScorersIds;
        this.actualAssistantsIds=m.actualAssistantsIds;
    }
}