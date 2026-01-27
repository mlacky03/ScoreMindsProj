export class User {
    constructor(
        private _id: number | null,
        private _username: string,
        private _email: string,
        private _passwordHash: string,
        private _createdAt: Date = new Date(),
        private _profileImageUrl: string
    ) {
        
        
    }


    public updateProfileImage(url: string): void {
        this._profileImageUrl = url;
    }

    public changePassword(newPasswordHash: string): void {
        this._passwordHash = newPasswordHash;
    }

    public updateUser(username:string|undefined,email:string, profileImageUrl:string |undefined):void
    {
        this._username = username || this._username;
        this._email = email || this._email;
        this._profileImageUrl = profileImageUrl || this._profileImageUrl;
    }

    
    private validateEmail(email: string): boolean {
        return email.includes('@'); 
    }

    
    get id() { return this._id; }
    get username() { return this._username; }
    get email() { return this._email; }
    get passwordHash() { return this._passwordHash; }
    get createdAt() { return this._createdAt; }
    get profileImageUrl() { return this._profileImageUrl; }
}