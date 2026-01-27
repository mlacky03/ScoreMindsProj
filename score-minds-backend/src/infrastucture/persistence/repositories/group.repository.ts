import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Group } from 'src/domain/models/group.model';
import { Group as GroupEntity } from '../entities/group.entity';
import { GroupMapper } from '../mappers/group-mapper';
import { GroupUser as GroupUserEntity } from '../entities/group-user.entity';

@Injectable()
export class GroupRepository extends BaseRepository<Group, GroupEntity> {
    constructor(
        @InjectRepository(GroupEntity)
        typeOrmRepo: Repository<GroupEntity>,
        private dataSource: DataSource

    ) {
        super(typeOrmRepo, new GroupMapper());
    }

    async findByOwner(ownerId: number): Promise<Group[]> {
        const entities = await this.typeOrmRepo.find({ 
            where: { ownerId } ,
            order: {
                createdAt: 'DESC'
            }
        });
        return this.mapper.toDomainList(entities);
    }

    async createGroupWithOwner(groupModel: Group, ownerId: number): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const groupEntity = queryRunner.manager.create(GroupEntity, {
        name: groupModel.name,
        profileImageUrl: groupModel.profileImageUrl,
        createdAt: new Date(),
        ownerId: ownerId

      });

      const savedGroup = await queryRunner.manager.save(groupEntity);

      const memberEntity = queryRunner.manager.create(GroupUserEntity, {
        userId: ownerId,
        group: savedGroup, 
        role: 'OWNER',
        joinedAt: new Date()
      });

      await queryRunner.manager.save(memberEntity);

     
      await queryRunner.commitTransaction();

      return this.mapper.toDomain(savedGroup);

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }



    
}
