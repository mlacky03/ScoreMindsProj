import { BaseMapper } from "./base.mapper";
import { GroupUser } from "../entities/group-user.entity";
import { GroupUser as DomainGroupUser } from "src/domain/models/group-user.model";
import { Group } from "../entities/group.entity";
import { User } from "../entities/user.entity";

export class GroupUserMapper extends BaseMapper<DomainGroupUser, GroupUser> {
    
    toDomain(entity: GroupUser): DomainGroupUser {
        return new DomainGroupUser(
            entity.id,
            entity.groupId,
            entity.userId,
            entity.joinedAt,
            entity.hasLeft,
            entity.leftAt
        );
    }
    
    toPersistence(domain: DomainGroupUser): GroupUser {
        const entity= new GroupUser()
        if (domain.id) entity.id = domain.id;
        entity.group = { id: domain.groupId } as Group;
        entity.user = { id: domain.userId } as User;
        entity.hasLeft = domain.hasLeft;
        entity.leftAt = domain.leftAt;
        return entity;
    }
    
}