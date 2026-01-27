// src/infrastructure/persistence/mappers/prediction.mapper.ts
import { PersonalPrediction } from 'src/domain/models/personal-prediction.model';
import { PersonalPrediction as PersonalPredictionEntity } from '../entities/personal-prediction.entity';
import { BaseMapper } from './base.mapper';
import { PredictionEventMapper } from './prediction-event.mapper';
import { User } from '../entities/user.entity';
import { MatchMapper } from './match.mapper';
import { Match } from '../entities/matches.entity';

export class PersonalPredictionMapper extends BaseMapper<PersonalPrediction, PersonalPredictionEntity> {
    private eventMapper = new PredictionEventMapper();
    private matchMapper = new MatchMapper();
    toDomain(entity: PersonalPredictionEntity): PersonalPrediction {
       
        const events = entity.predictedEvents 
            ? entity.predictedEvents.map(e => this.eventMapper.toDomain(e)) 
            : [];
        const match = entity.match ? this.matchMapper.toDomain(entity.match) : null;
        return new PersonalPrediction(
            entity.id,
            entity.matchId,
            entity.predictedHomeScore,
            entity.predictedAwayScore,
            entity.winner,
            entity.totalPoints,
            entity.createdAt,
            entity.updatedAt,
            events ,
            match,
            entity.userId
        );
    }

    toPersistence(domain: PersonalPrediction): PersonalPredictionEntity {
        const entity = new PersonalPredictionEntity();
        if (domain.id) entity.id = domain.id;
        
        entity.predictedHomeScore = domain.predictedHomeScore;
        entity.predictedAwayScore = domain.predictedAwayScore;
        entity.totalPoints = domain.totalPoints;
        entity.winner = domain.winner;
        
        
        entity.user = { id: domain.userId } as User;
        entity.match = { id: domain.matchId } as Match;
        entity.updatedAt=new Date();
        
        if (domain.predictedEvents.length > 0) {
            entity.predictedEvents = domain.predictedEvents.map(e => 
                this.eventMapper.toPersistence(e)
            );
        }

        return entity;
    }
}
