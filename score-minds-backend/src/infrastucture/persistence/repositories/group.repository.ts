import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Group } from 'src/domain/models/group.model';
import { Group as GroupEntity } from '../entities/group.entity';
import { GroupMapper } from '../mappers/group-mapper';
import { GroupUser as GroupUserEntity } from '../entities/group-user.entity';
import { FilterGroupDto } from 'src/application/dtos/group-dto/filter-group.dto';
import { User } from '@supabase/supabase-js';
import { COMMON_SELECT_FIELDS, getSelectFields, PAGINATION } from 'src/common/constants/pagination.constants';
@Injectable()
export class GroupRepository extends BaseRepository<Group, GroupEntity> {
    constructor(
        @InjectRepository(GroupEntity)
        typeOrmRepo: Repository<GroupEntity>,
        private dataSource: DataSource

    ) {
        super(typeOrmRepo, new GroupMapper());
    }

    async findAllWithFilters(filter?: FilterGroupDto): Promise<Group[]> {
        const qb = this.CreateBaseQueryBuilder("group")
            .select(getSelectFields("group", COMMON_SELECT_FIELDS.GROUP));

        this.applySearch(qb,
            {
                search: ['name'],
                searchTherm: typeof filter?.query === 'string' ? filter.query : ''
            }
        );

        this.applyPaggination(qb,
            {
                limit: PAGINATION.USER_SEARCH_LIMIT,
                sort: 'name',
                order: "DESC"

            }
        )

        const entities = await qb.getMany();
        return this.mapper.toDomainList(entities);
    }


    async findByOwner(ownerId: number): Promise<Group[]> {
        const entities = await this.typeOrmRepo.find({
            where: { ownerId },
            order: {
                createdAt: 'DESC'
            }
        });
        return this.mapper.toDomainList(entities);
    }

    async findAllForMember(memberId: number,name:string): Promise<Group[]> {
        const whereCondition: any = {
            members: { userId: memberId }
        };

        
        if (name) {
            
            whereCondition.name = ILike(`%${name}%`);
        }
        const entities = await this.typeOrmRepo.find({
            where: whereCondition,
            order: {
                createdAt: 'ASC'
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
