import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalculatingWorker } from 'src/presentation/workers/calculating.worker'; 
import { CalculatingService } from 'src/application/services/calculating.service';
import { AppGateway } from 'src/gateway/app.gateway';

import { Match } from 'src/infrastucture/persistence/entities/matches.entity';
import { PersonalPrediction } from 'src/infrastucture/persistence/entities/personal-prediction.entity';
import { MatchModule } from './matches.module';
import { PersonalPredictionModule } from './personal-predictition.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';


@Module({
  imports: [
    MatchModule,
    forwardRef(() => PersonalPredictionModule),
    UserModule,
    AuthModule,
  ],
  controllers: [
    CalculatingWorker 
  ],
  providers: [
    CalculatingService, 
    AppGateway,
    UserValidationService,

  ],
})
export class CalculatingModule {}