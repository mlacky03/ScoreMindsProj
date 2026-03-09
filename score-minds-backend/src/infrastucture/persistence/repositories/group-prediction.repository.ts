import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { GroupPrediction } from 'src/domain/models/group-prediction.model';
import { GroupPrediction as PredictionEntity } from '../entities/group-prediction.entity';
import { GroupPredictionMapper } from '../mappers/group-prediction.mapper';

@Injectable()
export class GroupPredictionRepository extends BaseRepository<GroupPrediction, PredictionEntity> {
    constructor(
        @InjectRepository(PredictionEntity)
        typeOrmRepo: Repository<PredictionEntity>
    ) {
        super(typeOrmRepo, new GroupPredictionMapper());
    }


    async findById(id: number): Promise<GroupPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({
            where: { id },
            relations: ['predictedEvents']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByGroupIdAndMatch(groupId: number, matchId: number): Promise<GroupPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({
            where: { groupId, matchId },
            relations: ['predictedEvents']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByGroupId(groupId: number): Promise<GroupPrediction[]> {
        const entities = await this.typeOrmRepo.find({
            where: { groupId },
            relations: ['predictedEvents']
        });
        return entities.map(entity => this.mapper.toDomain(entity));
    }

    async findByGroupIdUpcoming(groupId: number,page:number,size:number): Promise<[GroupPrediction[],number]> {
        const [entities,total] = await this.typeOrmRepo.findAndCount({
            where: { groupId ,match: { status: In(['NS', 'LIVE']) } },
            relations: ['predictedEvents','match'],
            order:{match:{startTime:'ASC'}},
            skip: (page - 1) * size,
            take: size
        });
        const e= entities.map(entity => this.mapper.toDomain(entity));
        return [e,total];
    }

    async findByGroupIdHistory(groupId: number,page:number,size:number): Promise<[GroupPrediction[],number]> {
        const [entities,total ]= await this.typeOrmRepo.findAndCount({
            where: { groupId ,match: { status: 'FT' } },
            relations: ['predictedEvents','match'],
            order: {
                match: {
                    startTime: 'DESC' 
                }
            },
            take: size,
            skip: (page - 1) * size
        });
        const e=entities.map(entity => this.mapper.toDomain(entity));
        return [e,total]
    }

    async findPredictionByGroupIdWithRelations(groupId: number, predictionId: number): Promise<GroupPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({
            where: { groupId, id: predictionId },
            relations: ['predictedEvents', 'match']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByGroupIdWithoutRelations(groupId: number, predictionId: number): Promise<GroupPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({
            where: { groupId, id: predictionId },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async deleteMany(predictionIds: number[]): Promise<void> {
        await this.typeOrmRepo.delete(predictionIds);
    }

    async findByMatchId(matchId: number): Promise<GroupPrediction[]> {
        const entities = await this.typeOrmRepo.find({
            where: { matchId },
            relations: ['predictedEvents']
        });
        return entities.map(entity => this.mapper.toDomain(entity));
    }
}