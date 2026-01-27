
import { PredictionAudit } from 'src/domain/models/prediction-audit.model';
import { PredictionAudit as PredictionAuditEntity } from '../entities/prediction-audit.entity';
import { BaseMapper } from './base.mapper';
import { User } from '../entities/user.entity';

export class PredictionAuditMapper extends BaseMapper<PredictionAudit, PredictionAuditEntity> {
    toDomain(entity: PredictionAuditEntity): PredictionAudit {
        return new PredictionAudit(
            entity.id,
            entity.predictionId,
            entity.userId, 
            entity.action,
            entity.changes,
            entity.createdAt
        );
    }

    toPersistence(domain: PredictionAudit): PredictionAuditEntity {
        const entity = new PredictionAuditEntity();
        if (domain.id) entity.id = domain.id;
        entity.predictionId = domain.predictionId;
        entity.user = { id: domain.userId } as User;
        entity.action = domain.action;
        entity.changes = domain.changes;
        return entity;
    }
}