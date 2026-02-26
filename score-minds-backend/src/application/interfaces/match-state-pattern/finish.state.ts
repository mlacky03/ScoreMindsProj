import { IMatchState } from './imatch.state';
import { Match } from 'src/domain/models/match.model';
import { CreatePredictionDto } from 'src/application/dtos/personal-prediction-dto/create-prediction.dto';
import { BadRequestException } from '@nestjs/common';

export class FinishedState implements IMatchState {
  handlePrediction(context: Match): void {
    throw new BadRequestException('Meč je već završen!');
  }
}