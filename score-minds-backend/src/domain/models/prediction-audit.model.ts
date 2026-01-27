import { CreateOption } from "../enums/CreateOption";


export class PredictionAudit {
    constructor(
        private _id: number | null,
        private _predictionId: number,
        private _userId: number,
        private _action: CreateOption,
        private _changes: any,
        private _createdAt: Date = new Date()
    ) {}

    
  
    public hasScoreChanged(): boolean {
        return this._changes && (this._changes.homeScore !== undefined || this._changes.awayScore !== undefined);
    }

    
    get id() { return this._id; }
    get predictionId() { return this._predictionId; }
    get userId() { return this._userId; }
    get action() { return this._action; }
    get changes() { return this._changes; }
    get createdAt() { return this._createdAt; }
}