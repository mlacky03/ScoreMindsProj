export class Player {
    constructor(
        private _id: number | null,
        private _externalId: number,
        private _name: string,
        private _position: string ,
        private _teamId: number ,
        private _photo: string 
    ) {
        if (!_name) {
            throw new Error("Ime igrača je obavezno.");
        }
    }

    
    public isGoalkeeper(): boolean {
        return this._position === 'Goalkeeper' || this._position === 'GK';
    }

    
    get id() { return this._id; }
    get externalId() { return this._externalId; }
    get name() { return this._name; }
    get position() { return this._position; }
    get teamId() { return this._teamId; }
    get photo() { return this._photo; }
}