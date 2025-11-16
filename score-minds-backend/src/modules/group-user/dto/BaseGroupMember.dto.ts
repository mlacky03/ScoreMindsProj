import { BaseUserDto } from "src/modules/user/dto/base-user.dto";
import { BaseGroupDto } from "src/modules/group/dto/base-group.dto";
import { GroupUser } from "../group-user.entity";

export class BaseGroupUserDto {
    id: number;
    userId: number;
    user: BaseUserDto;

    constructor(e: GroupUser) {
        this.id = e.id;
        this.userId = e.userId;
        this.user = new BaseUserDto(e.user);
    }
}