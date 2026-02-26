import { IMatchState } from './imatch.state';
import { Match } from 'src/domain/models/match.model';
import { CreatePredictionDto } from 'src/application/dtos/personal-prediction-dto/create-prediction.dto';
import { BadRequestException } from '@nestjs/common';

export class NotStartedState implements IMatchState {
  handlePrediction( context: Match): void {
    const now = new Date().getTime();
    const matchTime = context.startTime.getTime(); // startTime povlačimo iz contexta (Match)
    
    // Ako je razlika manja od 5 minuta (300,000 milisekundi)
    if (matchTime < now ) {
        throw new BadRequestException('Klađenje je zatvoreno 5 minuta pred početak!');
    }
  }
}