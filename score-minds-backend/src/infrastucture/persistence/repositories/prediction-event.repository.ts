import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { PredictionEvent } from 'src/domain/models/prediction-event.model';
import { PredictionEvent as PredictionEventEntity } from '../entities/prediction-event.entity';
import { PredictionEventMapper } from '../mappers/prediction-event.mapper';

@Injectable()
export class PredictionEventRepository extends BaseRepository<PredictionEvent, PredictionEventEntity> {
    constructor(
        @InjectRepository(PredictionEventEntity)
        typeOrmRepo: Repository<PredictionEventEntity>
    ) {
        super(typeOrmRepo, new PredictionEventMapper());
    }


    async findWithPlayers(predictionId: number): Promise<PredictionEvent[]> {
        const data=await this.typeOrmRepo.find({
            where: { personalPrediction: { id: predictionId } },
            relations: ['player']
        });
        if(!data) return [];
        return this.mapper.toDomainList(data);
    }

    async findByPredictionId(predictionId:number):Promise<PredictionEvent[]>
    {
        const data=await this.typeOrmRepo.find({where:{predictionId}})
        if(!data) return [];
        return this.mapper.toDomainList(data);
    }

    async deleteMany(predictionIds: number[]): Promise<void> {
       
        await this.typeOrmRepo.delete(predictionIds);
    }
}