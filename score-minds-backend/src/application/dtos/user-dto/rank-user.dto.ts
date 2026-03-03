import { User } from "src/domain/models/user.model";

export class RankUserDto {
    id:number;
    name: string;
    points: number;
    photoUrl?: string;
    rank: number;

    constructor(user:User, rank:number)
    {
        this.id=user.id!;
        this.name = user.username;
        this.points = user.personalPoints;
        this.photoUrl = user.profileImageUrl;
        this.rank=rank;
        
    }
}