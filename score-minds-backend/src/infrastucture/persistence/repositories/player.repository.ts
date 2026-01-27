import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Player } from 'src/domain/models/player.model';
import { Player as PlayerEntity } from '../entities/player.entity';
import { PlayerMapper } from '../mappers/player.mapper';

@Injectable()
export class PlayerRepository extends BaseRepository<Player, PlayerEntity> {
    constructor(
        @InjectRepository(PlayerEntity)
        typeOrmRepo: Repository<PlayerEntity>
    ) {
        super(typeOrmRepo, new PlayerMapper());
    }

    async findByTeamId(teamId: number): Promise<Player[]> {
        const entities = await this.typeOrmRepo.find({ where: { teamId } });
        return this.mapper.toDomainList(entities);
    }

    async findMany(ids: number[]): Promise<Player[]> {
        const entities = await this.typeOrmRepo.find({ where: { id: In(ids) } });
        return this.mapper.toDomainList(entities);
    }

    async upsert(data: Player[]): Promise<void> {
        await this.typeOrmRepo.upsert(this.mapper.toPersistenceList(data), ['externalId']);
    }
}