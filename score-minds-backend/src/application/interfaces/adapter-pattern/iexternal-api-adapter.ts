import { Match } from "src/domain/models/match.model";
import { Player } from "src/domain/models/player.model";

export interface IExternalApiAdapter {
  adaptToMatchModel(apiMatch: any): Partial<Match>;
  adaptToPlayerModel(apiPlayer: any, teamId: number): Partial<Player>;
}