import { GroupUser } from "./group-user.model";

export class Group {
    constructor(
        private _id: number | null,
        private _name: string,
        private _ownerId: number,
        private _createdAt: Date=new Date(),
        private _profileImageUrl: string|undefined,
        private _groupPoints: number=0,
        // Opciono: Možemo čuvati listu članova ako nam treba za logiku
        private _members: GroupUser[] = [] 
    ) {
        if (!_name || _name.trim().length === 0) {
            throw new Error("Ime grupe ne sme biti prazno.");
        }
    }

    

    public changeName(newName: string): void {
        if (newName.length < 3) {
            throw new Error("Ime grupe mora imati bar 3 slova.");
        }
        this._name = newName;
    }

    public updateProfileImage(url: string): void {
        this._profileImageUrl = url;
    }

    public isOwner(userId: number): boolean {
        return this._ownerId === userId;
    }

    public updateGroup(name: string | null, profileImageUrl: string | null): void {
        this._name = name || this._name;
        this._profileImageUrl = profileImageUrl || this._profileImageUrl;
    }

    
    get id() { return this._id; }
    get name() { return this._name; }
    get ownerId() { return this._ownerId; }
    get createdAt() { return this._createdAt; }
    get profileImageUrl() { return this._profileImageUrl; }
    get groupPoints() { return this._groupPoints; }
    get members() { return this._members; }
    
}