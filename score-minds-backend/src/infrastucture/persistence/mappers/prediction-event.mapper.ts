import { PredictionEvent } from 'src/domain/models/prediction-event.model';
import { PredictionEvent as PredictionEventEntity } from '../entities/prediction-event.entity';
import { BaseMapper } from './base.mapper';
import { Player } from '../entities/player.entity';
import { PersonalPrediction } from '../entities/personal-prediction.entity';
import { GroupPrediction } from '../entities/group-prediction.entity';

export class PredictionEventMapper extends BaseMapper<PredictionEvent, PredictionEventEntity> {
    toDomain(entity: PredictionEventEntity): PredictionEvent {

        return new PredictionEvent(
            entity.id,
            entity.type,
            entity.playerId,
            entity.personalPredictionId,
            entity.groupPredictionId,
            entity.minute
        
        );
    }

    toPersistence(domain: PredictionEvent): PredictionEventEntity {
        const entity = new PredictionEventEntity();
        if (domain.id) entity.id = domain.id;
        entity.type = domain.type;
        entity.minute = domain.minute;
        entity.player = { id: domain.playerId } as Player;
        entity.personalPredictionId=domain.personalPredictionId;
        entity.groupPredictionId=domain.groupPredictionId;
        entity.personalPrediction=domain.personalPredictionId?{id:domain.personalPredictionId} as PersonalPrediction:null;
        entity.groupPrediction=domain.groupPredictionId?{id:domain.groupPredictionId} as GroupPrediction:null;
        return entity;
    }
}