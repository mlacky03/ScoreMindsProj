import { User } from 'src/domain/models/user.model';
import { User as UserEntity } from '../entities/user.entity';
import { BaseMapper } from './base.mapper';

export class UserMapper extends BaseMapper<User, UserEntity> {
    toDomain(entity: UserEntity): User {
        return new User(
            entity.id,
            entity.username,
            entity.email,
            entity.passwordHash,
            entity.createdAt,
            entity.profileImageUrl
        );
    }

    toPersistence(domain: User): UserEntity {
        const entity = new UserEntity();
        if (domain.id) entity.id = domain.id;
        entity.username = domain.username;
        entity.email = domain.email;
        entity.passwordHash = domain.passwordHash;
        entity.profileImageUrl = domain.profileImageUrl;
        return entity;
    }
}