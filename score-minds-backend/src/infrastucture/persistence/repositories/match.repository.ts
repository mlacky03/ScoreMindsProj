import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, SelectQueryBuilder, In, LessThanOrEqual } from 'typeorm';
import { BaseRepository, PagginationOptions } from './base.repository';
import { Match } from 'src/domain/models/match.model';
import { Match as MatchEntity } from '../entities/matches.entity';
import { MatchMapper } from '../mappers/match.mapper';

@Injectable()
export class MatchRepository extends BaseRepository<Match, MatchEntity> {
    constructor(
        @InjectRepository(MatchEntity)
        typeOrmRepo: Repository<MatchEntity>
    ) {
        super(typeOrmRepo, new MatchMapper());
    }

    async findMatchToStart(): Promise<Match[]> {
        const now = new Date();
        const entities = await this.typeOrmRepo.find({
            where: { status: 'NS', startTime: LessThanOrEqual(now) },

        });
        return this.mapper.toDomainList(entities);
    }

    async findMatchesByIds(ids: number[]): Promise<Match[]> {
        const entities = await this.typeOrmRepo.find({
            where: { id: In(ids) }
        });
        return this.mapper.toDomainList(entities);
    }

    async findAll(): Promise<Match[]> {
        const entities = await this.typeOrmRepo.find({ order: { startTime: 'DESC' } });
        return this.mapper.toDomainList(entities);
    }

    async findUpcoming(): Promise<Match[]> {
        const entities = await this.typeOrmRepo.find({
            where: {
                status: 'NS',
                startTime: MoreThan(new Date())
            },
            order: { startTime: 'ASC' }
        });
        return this.mapper.toDomainList(entities);
    }

    async findLiveMatches(): Promise<Match[]> {
        const entities = await this.typeOrmRepo.find({
            where: { status: 'LIVE' }
        });
        return this.mapper.toDomainList(entities);
    }

    async playerSync(team: number): Promise<Match[]> {
        const match = await this.typeOrmRepo.find({
            take: team,
            select: {
                homeTeamId: true,
                awayTeamId: true,
                id: true,
            },
            order: {
                startTime: 'DESC' // ili 'ASC'
            }
        })
        return this.mapper.toDomainList(match);
    }

    async upsert(matches: Match[]): Promise<void> {
        await this.typeOrmRepo.upsert(this.mapper.toPersistenceList(matches), ['externalId']);
    }

    async findFinishedMatches(): Promise<Match[]> {
        const entities = await this.typeOrmRepo.find({
            where: { status: 'FT' }
        });
        return this.mapper.toDomainList(entities);
    }


}