import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { User } from 'src/domain/models/user.model';
import { User as UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

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
    async findLeaderboard():Promise<User[]>
    {
        const e= await this.typeOrmRepo.find({
            order: {
                personalPoints: 'DESC'
            },
            take: 10

        });

        return this.mapper.toDomainList(e);
    }

    async findByUsername(username: string): Promise<User | null> {
        const entity = await this.typeOrmRepo.findOne({ where: { username } });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findAllWithFilters(search: string): Promise<User[]> {
    const whereConditions: any[] = []; 

    if (search) {
        whereConditions.push(
            { username: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) }
        );
    }

    const entities = await this.typeOrmRepo.find({
        where: whereConditions.length > 0 ? whereConditions : {},
        order: {
            createdAt: 'ASC'
        }
    });
    
    return this.mapper.toDomainList(entities);
}
}