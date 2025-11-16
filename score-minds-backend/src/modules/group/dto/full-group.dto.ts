import { BaseUserDto } from "src/modules/user/dto/base-user.dto";
import { Group } from "../group.entity";

export class FullGroupDto
{
    groupName:string;
    profileImageUrl?:string;
    points:number;
    members:BaseUserDto[];
    createdAt:Date;
    owner:BaseUserDto;
    
    constructor(entity:Group)
    {
        this.groupName=entity.groupName;
        this.profileImageUrl=entity.profileImageUrl;
        this.points=0;
        this.members=entity.members?.map(member=>new BaseUserDto(member)||[]);

    }

}