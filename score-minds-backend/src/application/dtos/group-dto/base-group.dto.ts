import { Group } from "src/domain/models/group.model";
import { BaseUserDto } from "../user-dto/base-user.dto";

export class BaseGroupDto {
  id: number;
  name: string;
  profileImageUrl? : string;
  points: number;
  owner: number;

  constructor(entity: Group) {
    this.id = entity.id!;
    this.profileImageUrl = entity.profileImageUrl;
    this.name = entity.name;
    this.owner = entity.ownerId;
    this.points=entity.groupPoints;
  }
}