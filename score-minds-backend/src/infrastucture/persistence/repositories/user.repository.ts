import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { User } from 'src/domain/models/user.model';
import { User as UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { FilterUserDto } from 'src/application/dtos/user-dto/fileter-user.dto';
import { BaseService } from 'src/common/services/base.service';
import { COMMON_SELECT_FIELDS, getSelectFields, PAGINATION } from 'src/common/constants/pagination.constants';

@Injectable()
export class UserRepository extends BaseRepository<User, UserEntity> {
    constructor(
        @InjectRepository(UserEntity)
        typeOrmRepo: Repository<UserEntity>
    ) {
        super(typeOrmRepo, new UserMapper());
    }


    async findByEmail(email: string): Promise<User | null> {
        const entity = await this.typeOrmRepo.findOne({ where: { email } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const entity = await this.typeOrmRepo.findOne({ where: { username } });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findAllWithFilters(filter?: FilterUserDto): Promise<User[]> {
        const qb = this.CreateBaseQueryBuilder("user")
            .select(getSelectFields("user", COMMON_SELECT_FIELDS.USER));

        this.applySearch(qb,
            {
                search: ['username', 'email'],
                searchTherm: typeof filter?.query === 'string' ? filter.query : ''
            }
        );

        this.applyPaggination(qb,
            {
                limit: PAGINATION.USER_SEARCH_LIMIT,
                sort: 'username',
                order: "DESC"

            }
        )

        const entities = await qb.getMany();
        return this.mapper.toDomainList(entities);
    }
}