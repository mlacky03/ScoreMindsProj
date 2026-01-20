import { Injectable } from "@nestjs/common";
import { Match } from "src/modules/matches/matches.entity";
import { Player } from "src/modules/players/player.entity";

@Injectable()
export class Adapter {
    adaptToMatchEntity(apiMatch: any): Partial<Match> {
    return {
        externalId: apiMatch.fixture.id,
        homeTeamName: apiMatch.teams.home.name,
        awayTeamName: apiMatch.teams.away.name,
        homeTeamLogo: apiMatch.teams.home.logo,
        awayTeamLogo: apiMatch.teams.away.logo,
        startTime: new Date(apiMatch.fixture.date),
        status: apiMatch.fixture.status.short,
        finalScoreHome: apiMatch.goals.home,
        finalScoreAway: apiMatch.goals.away,
    };
  }

  adaptToPlayerEntity(apiPlayer: any, teamId: number): Partial<Player> {
    return {
      externalId: apiPlayer.id,
      name: apiPlayer.name,
      photo: apiPlayer.photo,
      position: apiPlayer.position,
      teamId: teamId,
    };
  }
}

