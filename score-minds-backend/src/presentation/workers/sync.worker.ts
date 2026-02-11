import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { SyncService } from "src/application/services/sync.service";
import { MatchRepository } from "src/infrastucture/persistence/repositories/match.repository";
import { PlayerRepository } from "src/infrastucture/persistence/repositories/player.repository";

@Controller()
export class SyncWorker {
    constructor(
        private matchRepo: MatchRepository,
        private playerRepo: PlayerRepository
    ) { }

    @EventPattern('sync_league_matches')
    async syncLeagueMatches(@Payload() data: any[]) {
        if(!data || data.length === 0) return;
        await this.matchRepo.upsert(data);
    }

    @EventPattern('sync_players_for_team')
    async syncPlayersForTeam(@Payload() data: any[]) {
        if(!data || data.length === 0) return;
        await this.playerRepo.upsert(data);
    }

    // @EventPattern('update_match')
    // async updateMatch(@Payload() data: any) {
    //     const match = await this.matchRepo.findById(data.id);
    //     if(!match) return;
    //     match.updateMatch(data);
    //     await this.matchRepo.save(match);
    // }
}

