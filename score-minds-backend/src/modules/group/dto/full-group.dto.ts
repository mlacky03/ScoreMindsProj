import { BaseUserDto } from "src/modules/user/dto/base-user.dto";
import { Group } from "../group.entity";
import { BaseGroupUserDto } from "src/modules/group-user/dto/BaseGroupMember.dto";

export class FullGroupDto
{
    id:number
    name:string;
    profileImageUrl?:string;
    points:number;
    members:BaseGroupUserDto[];
    createdAt:Date;
    owner:BaseUserDto;
    
    constructor(entity:Group)
    {
        this.id=entity.id;
        this.name=entity.name;
        this.profileImageUrl=entity.profileImageUrl;
        this.points=0;
        this.members=entity.members?.map(member=>new BaseGroupUserDto(member)||[]);

    }

}