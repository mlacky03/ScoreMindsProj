import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FootballApiService } from "../../common/services/football-api.service";
import { Adapter } from "../../common/patterns/Adapter";
import { UpdateMatchDto } from "../dtos/matches-dto/update-match.dto";
import { ClientProxy } from "@nestjs/microservices";
import { MatchRepository } from "src/infrastucture/persistence/repositories/match.repository";


@Injectable()
export class SyncService {
  constructor(
    private footballApi: FootballApiService,
    @Inject(MatchRepository)
    private matchRepo: MatchRepository,
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
    private adapter: Adapter,
  ) { }

  async syncLeagueMatches(leagueId: number, season: number): Promise<{ message: string }> {
    const apiMatches = await this.footballApi.getMatches(leagueId, season);
    console.log(`API je vratio ${apiMatches?.length} mečeva.`);

    const matchesPayload = apiMatches.map(m => this.adapter.adaptToMatchModel(m));

    const chunks = chunkArray(matchesPayload, 100);

    for (const chunk of chunks) {

      this.rabbitClient.emit('sync_league_matches', chunk);

    }
    return { message: "Utakmice su uspesno poslate u RabbitMQ." };
  }

  async syncPlayersForTeam() {
    const match = await this.matchRepo.playerSync(43);

    //const teamIds = match.flatMap(m => [m.homeTeamId, m.awayTeamId]);
    const teamIds = [540,530,529,548,531];
    const uniqueTeamIds = new Set(teamIds);
    
    for (const teamId of uniqueTeamIds) {
      const apiPlayers = await this.footballApi.getPlayersByTeam(teamId);
      if (!apiPlayers || apiPlayers.length === 0) continue;

      const uniquePlayersMap = new Map();


      for (const p of apiPlayers) {

        const model = this.adapter.adaptToPlayerModel(p, teamId);

        if (model.externalId) {
          uniquePlayersMap.set(model.externalId, model);
        }
      }
      const playersToSave = Array.from(uniquePlayersMap.values());

      if (playersToSave.length > 0) {
        this.rabbitClient.emit('sync_players_for_team', playersToSave);

      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

  }


  async checkApiStatus() {


    const url = "https://v3.football.api-sports.io/status";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": "56e0bea445d94bc6110e6e51fdcb9136"
        }
      });

      const data = await response.json();
      console.log("STATUS PROVERA:", JSON.stringify(data, null, 2));

      return data;
    } catch (err) {
      console.error("STATUS GREŠKA:", err.message);
    }
  }
  async simulateMatchUpdate(matchId: number, dto: UpdateMatchDto): Promise<{ message: string }> {

    const payload = {
      id:matchId,  
      status: dto.status, 
      finalScoreHome: dto.homeScore, 
      finalScoreAway: dto.awayScore, 
      actualScorersIds: dto.scorerIds, 
      actualAssistantsIds: dto.assistIds, 
    };

    this.rabbitClient.emit('update_match', payload);

    console.log(`📢 SIMULACIJA: Rezultat promenjen na ${dto.homeScore}:${dto.awayScore} (${dto.status})`);

    return { message: "Utakmica je uspesno poslata u RabbitMQ." };
  }
}
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

