import { Group } from "../group.entity";
import { BaseUserDto } from "src/modules/user/dto/base-user.dto";

export class BaseGroupDto {
  id: number;
  groupName: string;
  profileImageUrl? : string;
  points: number;
  owner: BaseUserDto;

  constructor(entity: Group) {
    this.id = entity.id;
    this.profileImageUrl = entity.profileImageUrl;
    this.groupName = entity.groupName;
    this.owner = entity.owner;
    this.points=0;
  }
}