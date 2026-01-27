import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { GroupUser } from 'src/domain/models/group-user.model';
import { GroupUser as GroupUserEntity } from '../entities/group-user.entity';
import { GroupUserMapper } from '../mappers/group-user.mapper';

@Injectable()
export class GroupUserRepository extends BaseRepository<GroupUser, GroupUserEntity> {
    constructor(
        @InjectRepository(GroupUserEntity)
        typeOrmRepo: Repository<GroupUserEntity>
    ) {
        super(typeOrmRepo, new GroupUserMapper());
    }

    async findByGroupId(groupId: number): Promise<GroupUser[]> {
        const entities = await this.typeOrmRepo.find({ where: { groupId } });
        return this.mapper.toDomainList(entities);
    }

    async findByUserId(userId: number): Promise<GroupUser[]> {
        const entities = await this.typeOrmRepo.find({ where: { userId } });
        return this.mapper.toDomainList(entities);
    }

    async findUserGroup(userId: number, groupId: number): Promise<GroupUser | null> {
        const entity = await this.typeOrmRepo.findOne({ where: { userId, groupId } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    
}