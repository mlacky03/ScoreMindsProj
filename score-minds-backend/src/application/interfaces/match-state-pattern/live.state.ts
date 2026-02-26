import { IMatchState } from './imatch.state';
import { Match } from 'src/domain/models/match.model';
import { CreatePredictionDto } from 'src/application/dtos/personal-prediction-dto/create-prediction.dto';
import { ForbiddenException } from '@nestjs/common'; // NestJS ugrađena greška!

export class LiveState implements IMatchState {
  handlePrediction( context: Match): void {
    // Čim neko pokuša da sačuva predikciju za live meč, NestJS automatski baca 403 HTTP status
    throw new ForbiddenException('Klađenje je zabranjeno, meč je već u toku!');
  }
}