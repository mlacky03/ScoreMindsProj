import { Group } from 'src/domain/models/group.model';
import { Group as GroupEntity } from '../entities/group.entity';
import { BaseMapper } from './base.mapper';
import { User } from '../entities/user.entity';

export class GroupMapper extends BaseMapper<Group, GroupEntity> {
    toDomain(entity: GroupEntity): Group {
        return new Group(
            entity.id,
            entity.name,
            entity.ownerId, 
            entity.createdAt,
            entity.profileImageUrl,
            entity.groupPoints
        );
    }

    toPersistence(domain: Group): GroupEntity {
        const entity = new GroupEntity();
        if (domain.id) entity.id = domain.id;
        entity.name = domain.name;
        entity.profileImageUrl = domain.profileImageUrl!;
        entity.groupPoints = domain.groupPoints;
        entity.owner = { id: domain.ownerId } as User;
        return entity;
    }
}