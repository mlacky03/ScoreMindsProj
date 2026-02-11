import { Match } from "src/domain/models/match.model";
import { FullMatchDto } from "./full-match.dto";

export class BaseMatchDto {
    id:number;
    externalId:number;
    awayTeamName:string;
    homeTeamName:string;
    awayTeamLogo:string;
    homeTeamLogo:string;
    startTime:Date;
    status:string;
    isComputed:boolean;
    
    constructor(m: Match | FullMatchDto) {
       this.id=m.id!;
       this.externalId=m.externalId;
       this.awayTeamName=m.awayTeamName;
       this.homeTeamName=m.homeTeamName;
       this.startTime=m.startTime;
       this.status=m.status;
       this.awayTeamLogo=m.awayTeamLogo;
       this.homeTeamLogo=m.homeTeamLogo;
       this.isComputed=m.isComputed;
    }
}