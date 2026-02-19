import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { SyncService } from "src/application/services/sync.service";
import { MatchRepository } from "src/infrastucture/persistence/repositories/match.repository";
import { PlayerRepository } from "src/infrastucture/persistence/repositories/player.repository";
import { AppGateway } from "src/gateway/app.gateway";

@Controller()
export class SyncWorker {
    constructor(
        private matchRepo: MatchRepository,
        private playerRepo: PlayerRepository,
        private appGateway: AppGateway
    ) { }

    @EventPattern('sync_league_matches')
    async syncLeagueMatches(@Payload() data: any[]) {
        if (!data || data.length === 0) return;
        await this.matchRepo.upsert(data);
    }

    @EventPattern('sync_players_for_team')
    async syncPlayersForTeam(@Payload() data: any[]) {
        if (!data || data.length === 0) return;
        await this.playerRepo.upsert(data);
    }

    @EventPattern('update_match')
    handleMatchUpdate(@Payload() data: any) {
        console.log(`📡 RabbitMQ -> WebSocket: Update za meč ${data.id}`);


        this.appGateway.broadcastMatchUpdate(data.id, data);
        this.appGateway.broadcastMatchStatusChange(data.id, data.status);
    }

    @EventPattern('update_match_list')
    handleMatchListUpdate(@Payload() data: any) {
        console.log(`📡 RabbitMQ -> WebSocket: Update liste mečeva`);

        this.appGateway.broadcastMatchStatusChange(data.id, data.status);
    }

    @EventPattern('prediction-computed')
    handlePredictionComputed(@Payload() data: any) {
        console.log(`📡 RabbitMQ -> WebSocket: Prediction computed for user ${data.userId}`);

        this.appGateway.brodcastPredictionComputedChange(data.predictionId, data);
    }

    

    @EventPattern('prediction-list-changed')
    handlePredictionListChanged(@Payload() data: any) {
        console.log(`📡 RabbitMQ -> WebSocket: Prediction list changed for user ${data.userId}`);

        this.appGateway.brodcastPredictionListChagne(data.predictionId, data);
    }
}

