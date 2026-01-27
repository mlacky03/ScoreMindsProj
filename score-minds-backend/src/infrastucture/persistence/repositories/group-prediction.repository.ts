import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    async findPredictionByGroupIdWithRelations(groupId: number,predictionId: number): Promise<GroupPrediction|null>
    {
        const entity = await this.typeOrmRepo.findOne({
            where: { groupId, id: predictionId },
            relations: ['predictedEvents','match']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByGroupIdWithoutRelations(groupId:number,predictionId:number):Promise<GroupPrediction|null>
    {
        const entity = await this.typeOrmRepo.findOne({
            where: { groupId, id: predictionId },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async deleteMany(predictionIds: number[]): Promise<void> {
        await this.typeOrmRepo.delete(predictionIds);
    }
}