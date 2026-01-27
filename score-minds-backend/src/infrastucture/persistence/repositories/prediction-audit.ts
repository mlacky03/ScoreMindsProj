import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { PredictionAudit } from 'src/domain/models/prediction-audit.model';
import { PredictionAudit as PredictionAuditEntity } from '../entities/prediction-audit.entity';
import { PredictionAuditMapper } from '../mappers/prediction-audit.mapper';

@Injectable()
export class PredictionAuditRepository extends BaseRepository<PredictionAudit, PredictionAuditEntity> {
    constructor(
        @InjectRepository(PredictionAuditEntity)
        typeOrmRepo: Repository<PredictionAuditEntity>
    ) {
        super(typeOrmRepo, new PredictionAuditMapper());
    }

    async findByPredictionId(predictionId: number): Promise<PredictionAudit[]> {
        const entities = await this.typeOrmRepo.find({
            where: { predictionId },
            order: { createdAt: 'DESC' } 
        });
        return this.mapper.toDomainList(entities);
    }

   
}