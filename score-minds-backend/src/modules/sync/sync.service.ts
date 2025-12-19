import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "src/modules/matches/matches.entity";
import { Repository } from "typeorm";
import { Player } from "src/modules/players/player.entity";
import { FootballApiService } from "../../common/services/football-api.service";

@Injectable()
export class SyncService {
  constructor(
    private footballApi: FootballApiService,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Player) private playerRepo: Repository<Player>,
  ) {}

  async syncLeagueMatches(leagueId: number, season: number) {
    const apiMatches = await this.footballApi.getMatches(leagueId, season);

    for (const m of apiMatches) {
      await this.matchRepo.upsert({
        externalId: m.fixture.id,
        homeTeamName: m.teams.home.name,
        awayTeamName: m.teams.away.name,
        homeTeamLogo: m.teams.home.logo,
        awayTeamLogo: m.teams.away.logo,
        startTime: new Date(m.fixture.date),
        status: m.fixture.status.short,
        finalScoreHome: m.goals.home,
        finalScoreAway: m.goals.away,
      }, ['externalId']); 
    }
  }

  async syncPlayersForTeam(teamId: number) {
    const apiPlayers = await this.footballApi.getPlayersByTeam(teamId);

    for (const p of apiPlayers) {
      await this.playerRepo.upsert({
        externalId: p.id,
        name: p.name,
        photo: p.photo,
        position: p.position,
        teamId: teamId, 
      }, ['externalId']);
    }
  }
}