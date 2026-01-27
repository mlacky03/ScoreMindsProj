import { BaseUserDto } from "../user-dto/base-user.dto";
import { BaseGroupDto } from "../group-dto/base-group.dto";
import { GroupUser } from "src/domain/models/group-user.model";

export class BaseGroupUserDto {
    id: number;
    userId: number;
    user: BaseUserDto;
    groupId:number;

    constructor(e: GroupUser) {
        this.id = e.id!;
        this.userId = e.userId;
        this.groupId = e.groupId;
    }
}