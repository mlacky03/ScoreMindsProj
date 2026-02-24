export interface MatchBaseDto
{
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
}