import { Group } from "src/domain/models/group.model";

export class RankGroupDto {
    name:string;
    points:number;
    photoUrl?:string;
    rank:number;

    constructor(group:Group,index:number)
    {
        this.name = group.name;
        this.points = group.groupPoints;
        this.photoUrl = group.profileImageUrl;
        this.rank = index ;
    }
}