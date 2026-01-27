export class GroupUser {
    constructor(
        private _id: number | null,
        private _groupId: number,
        private _userId: number,
        private _joinedAt: Date,
        private _hasLeft: boolean = false,
        private _leftAt: Date | null = null
    ) {}

    
    public leave(): void {
        if (this._hasLeft) {
            throw new Error("Korisnik je već napustio grupu.");
        }
        this._hasLeft = true;
        this._leftAt = new Date();
    }

    public isActive(): boolean {
        return !this._hasLeft;
    }

    
    get id() { return this._id; }
    get groupId() { return this._groupId; }
    get userId() { return this._userId; }
    get joinedAt() { return this._joinedAt; }
    get hasLeft() { return this._hasLeft; }
    get leftAt() { return this._leftAt; }
}