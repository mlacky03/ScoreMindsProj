import { GroupPrediction as GroupPredictionEntity } from '../entities/group-prediction.entity';
import { BaseMapper } from './base.mapper';
import { PredictionEventMapper } from './prediction-event.mapper';
import { MatchMapper } from './match.mapper';
import { Match } from '../entities/matches.entity';
import { GroupPrediction } from 'src/domain/models/group-prediction.model';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';

export class GroupPredictionMapper extends BaseMapper<GroupPrediction, GroupPredictionEntity> {
    private eventMapper = new PredictionEventMapper();
    private matchMapper = new MatchMapper();
    toDomain(entity: GroupPredictionEntity): GroupPrediction {
       
        const events = entity.predictedEvents 
            ? entity.predictedEvents.map(e => this.eventMapper.toDomain(e)) 
            : [];
        const match = entity.match ? this.matchMapper.toDomain(entity.match) : null;
        return new GroupPrediction(
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
            entity.groupId,
            entity.status,
            entity.createdById,
            entity.lastUpdatedById
        );
    }

    toPersistence(domain: GroupPrediction): GroupPredictionEntity {
        const entity = new GroupPredictionEntity();
        if (domain.id) entity.id = domain.id;
        
        entity.predictedHomeScore = domain.predictedHomeScore;
        entity.predictedAwayScore = domain.predictedAwayScore;
        entity.totalPoints = domain.totalPoints;
        entity.winner = domain.winner;
        
        
        entity.group={id:domain.groupId} as Group;
        entity.match = { id: domain.matchId } as Match;
        entity.updatedAt=new Date();
        entity.status=domain.status;
        entity.createdBy={id:domain.createdById} as User;
        entity.lastUpdatedBy={id:domain.lastUpdatedById} as User;
        
        if (domain.predictedEvents.length > 0) {
            entity.predictedEvents = domain.predictedEvents.map(e => 
                this.eventMapper.toPersistence(e)
            );
        }

        return entity;
    }
}
