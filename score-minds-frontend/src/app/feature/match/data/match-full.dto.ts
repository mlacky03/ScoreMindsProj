export interface MatchFullDto{
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
    minutes:number|null;  
    events: EventRecord[];
}

export interface EventRecord {
  playerId: number;
  minute: number;
  type?: 'GOAL' | 'ASSIST'; 
}