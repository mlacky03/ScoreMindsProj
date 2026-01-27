import { PredictionEvent } from 'src/domain/models/prediction-event.model';
import { PredictionEvent as PredictionEventEntity } from '../entities/prediction-event.entity';
import { BaseMapper } from './base.mapper';
import { Player } from '../entities/player.entity';
import { PersonalPrediction } from '../entities/personal-prediction.entity';

export class PredictionEventMapper extends BaseMapper<PredictionEvent, PredictionEventEntity> {
    toDomain(entity: PredictionEventEntity): PredictionEvent {
        return new PredictionEvent(
            entity.id,
            entity.type,
            entity.playerId,
            entity.predictionId,
            entity.minute
        
        );
    }

    toPersistence(domain: PredictionEvent): PredictionEventEntity {
        const entity = new PredictionEventEntity();
        if (domain.id) entity.id = domain.id;
        entity.type = domain.type;
        entity.minute = domain.minute;
        entity.player = { id: domain.playerId } as Player;
        entity.predictionId=domain.predictionId;
        entity.personalPrediction = { id: domain.predictionId } as PersonalPrediction;
        return entity;
    }
}