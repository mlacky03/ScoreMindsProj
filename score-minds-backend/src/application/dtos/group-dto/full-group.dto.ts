import { BaseUserDto } from "../user-dto/base-user.dto";
import { Group } from "src/domain/models/group.model";
import { BaseGroupUserDto } from "src/application/dtos/group-user-dto/BaseGroupMember.dto";
import { GroupUser } from "src/domain/models/group-user.model";

export class FullGroupDto
{
    id:number
    name:string;
    profileImageUrl?:string;
    points:number;
    members:BaseGroupUserDto[];
    createdAt:Date;
    owner:BaseUserDto;
    
    constructor(entity:Group,members:BaseGroupUserDto [])
    {
        this.id=entity.id!;
        this.name=entity.name;
        this.profileImageUrl=entity.profileImageUrl;
        this.points=0;
        this.members=members;
    }

}