import { Group } from "src/domain/models/group.model";

export class RankGroupDto {
    id:number;
    name:string;
    points:number;
    photoUrl?:string;
    rank:number;

    constructor(group:Group,index:number)
    {
        this.id=group.id!;
        this.name = group.name;
        this.points = group.groupPoints;
        this.photoUrl = group.profileImageUrl;
        this.rank = index ;
    }
}