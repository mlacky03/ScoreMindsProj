import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { PersonalPrediction } from 'src/domain/models/personal-prediction.model';
import { PersonalPrediction as PredictionEntity } from '../entities/personal-prediction.entity';
import { PersonalPredictionMapper } from '../mappers/personal-prediction.mapper';

@Injectable()
export class PersonalPredictionRepository extends BaseRepository<PersonalPrediction, PredictionEntity> {
    constructor(
        @InjectRepository(PredictionEntity)
        typeOrmRepo: Repository<PredictionEntity>
    ) {
        super(typeOrmRepo, new PersonalPredictionMapper());
    }

    
    async findById(id: number): Promise<PersonalPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({ 
            where: { id },
            relations: ['predictedEvents'] 
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByUserAndMatch(userId: number, matchId: number): Promise<PersonalPrediction | null> {
        const entity = await this.typeOrmRepo.findOne({
            where: { userId, matchId },
            relations: ['predictedEvents']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    
    async findByUserId(userId: number): Promise<PersonalPrediction[]> {
        const entities = await this.typeOrmRepo.find({
            where: { userId },
            relations: ['predictedEvents']
        });
        return entities.map(entity => this.mapper.toDomain(entity));
    }

    async findPredictionByUserWithRelations(userId: number,predictionId: number): Promise<PersonalPrediction|null>
    {
        const entity = await this.typeOrmRepo.findOne({
            where: { userId, id: predictionId },
            relations: ['predictedEvents','match']
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async findByUserWithoutRelations(userId:number,predictionId:number):Promise<PersonalPrediction|null>
    {
        const entity = await this.typeOrmRepo.findOne({
            where: { userId, id: predictionId },
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }

    async deleteMany(predictionIds: number[]): Promise<void> {
        await this.typeOrmRepo.delete(predictionIds);
    }
}