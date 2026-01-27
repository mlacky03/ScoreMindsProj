import { Match } from 'src/domain/models/match.model';
import { Match as MatchEntity } from '../entities/matches.entity';
import { BaseMapper } from './base.mapper';

export class MatchMapper extends BaseMapper<Match, MatchEntity> {
    toDomain(entity: MatchEntity): Match {
        return new Match(
            entity.id,
            entity.externalId,
            entity.homeTeamName,
            entity.awayTeamName,
            entity.homeTeamId,
            entity.awayTeamId,
            entity.startTime,
            entity.status,
            entity.finalScoreHome,
            entity.finalScoreAway,
            entity.homeTeamLogo,
            entity.awayTeamLogo,
            entity.actualScorersIds || [],
            entity.actualAssistantsIds || []
        );
    }

    toPersistence(domain: Match): MatchEntity {
        const entity = new MatchEntity();
        if (domain.id) entity.id = domain.id;
        entity.externalId = domain.externalId;
        entity.homeTeamName = domain.homeTeamName;
        entity.awayTeamName = domain.awayTeamName;
        entity.homeTeamId = domain.homeTeamId;
        entity.awayTeamId = domain.awayTeamId;
        entity.startTime = domain.startTime;
        entity.status = domain.status;
        entity.finalScoreHome = domain.finalScoreHome;
        entity.finalScoreAway = domain.finalScoreAway;
        entity.homeTeamLogo = domain.homeTeamLogo;
        entity.awayTeamLogo = domain.awayTeamLogo;
        entity.actualScorersIds = domain.actualScorersIds;
        entity.actualAssistantsIds = domain.actualAssistantsIds;
        return entity;
    }
}