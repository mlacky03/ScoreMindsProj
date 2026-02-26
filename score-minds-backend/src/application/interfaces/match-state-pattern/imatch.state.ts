import { Match } from "src/domain/models/match.model";

import { CreatePredictionDto } from "../../dtos/personal-prediction-dto/create-prediction.dto";

export interface IMatchState {
  handlePrediction( context: Match): void;
}