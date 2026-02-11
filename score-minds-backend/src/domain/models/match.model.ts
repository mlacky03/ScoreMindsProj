import { EventRecord } from "src/application/interfaces/event-record";

export class Match {
    constructor(
        private _id: number | null,
        private _externalId: number,
        private _homeTeamName: string,
        private _awayTeamName: string,
        private _homeTeamId: number,
        private _awayTeamId: number,
        private _startTime: Date,
        private _status: string = 'NS',
        private _finalScoreHome: number | null = null,
        private _finalScoreAway: number | null = null,
        private _homeTeamLogo: string ,
        private _awayTeamLogo: string ,
        private _events: EventRecord[] = [],
        private _isComputed: boolean = false
    ) {}

    
    public finishMatch(): void {
        this._status = 'FT';
    }

    public startMatch(): void {
        this._status = 'LIVE';
    }


    
    public hasStarted(): boolean {
        return new Date() >= this._startTime || this._status !== 'NS';
    }

    public isFinished(): boolean {
        return this._status === 'FT';
    }

    // public updateMatch(match: Partial<Match>): void {
    //     Object.assign(this, match);
    // }
    public updateHomeScore(score:number):void{
        this._finalScoreHome = score;
    }

    public updateAwayScore(score:number):void{
        this._finalScoreAway = score;
    }

    public makeMatch(status: string,time:Date): void {
        this._status = status;
        this._startTime = time;
        this._finalScoreHome = null;
        this._finalScoreAway = null;
    }
    public updateStart(): void {
        this._status = 'LIVE';
        this._events=[];
        this._finalScoreHome=0;
        this._finalScoreAway=0;
    }
    public updateGoalscorer(playerId:number,minute:number): void {
        this._events.push({ playerId, minute, type: 'GOAL' });
    }
    public updateAssistant(playerId:number,minute:number): void {
        this._events.push({ playerId, minute, type: 'ASSIST' });
    }

    public computed(): void {
        this._isComputed = true;
    }
    
    get id() { return this._id; }
    get externalId() { return this._externalId; }
    get homeTeamName() { return this._homeTeamName; }
    get awayTeamName() { return this._awayTeamName; }
    get homeTeamId() { return this._homeTeamId; }
    get awayTeamId() { return this._awayTeamId; }
    get startTime() { return this._startTime; }
    get status() { return this._status; }
    get finalScoreHome() { return this._finalScoreHome; }
    get finalScoreAway() { return this._finalScoreAway; }
    get homeTeamLogo() { return this._homeTeamLogo; }
    get awayTeamLogo() { return this._awayTeamLogo; }
    get events() { return this._events; }
    get isComputed() { return this._isComputed; }
}
