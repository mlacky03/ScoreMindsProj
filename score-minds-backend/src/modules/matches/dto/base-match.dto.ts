import { Match } from "src/modules/matches/matches.entity"; 
import { FullMatchDto } from "src/modules/matches/dto/full-match.dto"

export class BaseMatchDto {
    id:number;
    externalId:number;
    awayTeamName:string;
    homeTeamName:string;
    awayTeamLogo:string;
    homeTeamLogo:string;
    startTime:Date;
    
    
    constructor(m: Match | FullMatchDto) {
       this.id=m.id;
       this.externalId=m.externalId;
       this.awayTeamName=m.awayTeamName;
       this.homeTeamName=m.homeTeamName;
       this.startTime=m.startTime;
    }
}