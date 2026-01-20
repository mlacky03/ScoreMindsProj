import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "src/modules/matches/matches.entity";
import { Repository } from "typeorm";
import { Player } from "src/modules/players/player.entity";
import { FootballApiService } from "../../common/services/football-api.service";
import { Adapter } from "../../common/patterns/Adapter";
import { UpdateMatchDto } from "../matches/dto/update-match.dto";
@Injectable()
export class SyncService {
  constructor(
    private footballApi: FootballApiService,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Player) private playerRepo: Repository<Player>,
    private adapter: Adapter,
  ) { }

  async syncLeagueMatches(leagueId: number, season: number) {
    const apiMatches = await this.footballApi.getMatches(leagueId, season);

    console.log(`API je vratio ${apiMatches?.length} mečeva.`);
    let scheduleTime = new Date();
    scheduleTime.setDate(scheduleTime.getDate() + 1);
    scheduleTime.setHours(18, 0, 0, 0);
    for (const m of apiMatches) {


      const matchEntityData = this.adapter.adaptToMatchEntity(m);


      matchEntityData.startTime = new Date(scheduleTime);
      matchEntityData.status = 'NS';
      matchEntityData.finalScoreHome = null;
      matchEntityData.finalScoreAway = null;

      await this.matchRepo.upsert(matchEntityData, ['externalId']);
    }
  }

  async syncPlayersForTeam(teamId: number) {
    const apiPlayers = await this.footballApi.getPlayersByTeam(teamId);

    console.log(`API je vratio ${apiPlayers?.length} igraca.`);

    for (const p of apiPlayers) {
      const playerEntityData = this.adapter.adaptToPlayerEntity(p, teamId);
      await this.playerRepo.upsert(playerEntityData, ['externalId']);
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
  async simulateMatchUpdate(matchId: number, dto: UpdateMatchDto) {

    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');


    match.finalScoreHome = dto.homeScore;
    match.finalScoreAway = dto.awayScore;
    match.status = dto.status;
    match.actualScorersIds = dto.scorerIds;
    match.actualAssistantsIds = dto.assistIds;


    const savedMatch = await this.matchRepo.save(match);


    console.log(`📢 SIMULACIJA: Rezultat promenjen na ${dto.homeScore}:${dto.awayScore} (${dto.status})`);

    return savedMatch;
  }
}