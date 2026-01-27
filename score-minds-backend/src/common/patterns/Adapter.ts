import { Injectable } from "@nestjs/common";
import { Match } from "src/domain/models/match.model";
import { Player } from "src/domain/models/player.model";

@Injectable()
export class Adapter {
  adaptToMatchModel(apiMatch: any): Partial<Match> {
    let scheduleTime = new Date(apiMatch.fixture.date);
    scheduleTime.setFullYear(scheduleTime.getFullYear() + 1);

    return {
      externalId: apiMatch.fixture.id,
      homeTeamName: apiMatch.teams.home.name,
      awayTeamName: apiMatch.teams.away.name,
      homeTeamLogo: apiMatch.teams.home.logo,
      awayTeamLogo: apiMatch.teams.away.logo,
      startTime: scheduleTime,
      status: 'NS',
      finalScoreHome: null,
      finalScoreAway: null,
      homeTeamId: apiMatch.teams.home.id,
      awayTeamId: apiMatch.teams.away.id,
    };
  }

  adaptToPlayerModel(apiPlayer: any, teamId: number): Partial<Player> {
    return {
      externalId: apiPlayer.id,
      name: apiPlayer.name,
      photo: apiPlayer.photo,
      position: apiPlayer.position,
      teamId: teamId,
    };
  }

  adapt
}

