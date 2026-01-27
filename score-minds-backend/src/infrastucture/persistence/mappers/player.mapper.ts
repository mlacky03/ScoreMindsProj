
import { Player } from 'src/domain/models/player.model';
import { Player as PlayerEntity } from '../entities/player.entity';
import { BaseMapper } from './base.mapper';

export class PlayerMapper extends BaseMapper<Player, PlayerEntity> {
    toDomain(entity: PlayerEntity): Player {
        return new Player(
            entity.id,
            entity.externalId,
            entity.name,
            entity.position,
            entity.teamId,
            entity.photo
        );
    }

    toPersistence(domain: Player): PlayerEntity {
        const entity = new PlayerEntity();
        if (domain.id) entity.id = domain.id;
        entity.externalId = domain.externalId;
        entity.name = domain.name;
        entity.position = domain.position;
        entity.teamId = domain.teamId;
        entity.photo = domain.photo;
        return entity;
    }
}