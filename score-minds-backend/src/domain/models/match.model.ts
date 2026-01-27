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
        private _actualScorersIds: number[] = [],
        private _actualAssistantsIds: number[] = []
    ) {}

    
    public finishMatch(homeScore: number, awayScore: number): void {
        if (homeScore < 0 || awayScore < 0) {
            throw new Error("Rezultat ne može biti negativan.");
        }
        this._finalScoreHome = homeScore;
        this._finalScoreAway = awayScore;
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

    public updateMatch(match: Partial<Match>): void {
        Object.assign(this, match);
    }
    public makeMatch(status: string,time:Date): void {
        this._status = status;
        this._startTime = time;
        this._finalScoreHome = null;
        this._finalScoreAway = null;
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
    get actualScorersIds() { return this._actualScorersIds; }
    get actualAssistantsIds() { return this._actualAssistantsIds; }
}