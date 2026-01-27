import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { GroupModule } from './group.module';
import { PersonalPredictionService } from 'src/application/services/personal-prediction.service';
import { PersonalPrediction } from 'src/infrastucture/persistence/entities/personal-prediction.entity';
import { PersonalPredictionController } from 'src/presentation/controllers/personal-prediction.controller';
import { PredictionEventService } from 'src/application/services/prediction-event.service';
import { PlayerModule } from './player.module';
import { MatchModule } from './matches.module';
import { UserModule } from './user.module';
import { PredictionEvent } from 'src/infrastucture/persistence/entities/prediction-event.entity';
import { PredictionAuditModule } from './prediction-audit.module';
import { PredictionAudit } from 'src/infrastucture/persistence/entities/prediction-audit.entity';
import { PersonalPredictionRepository } from 'src/infrastucture/persistence/repositories/personal-prediction.repository';
import { PredictionEventRepository } from 'src/infrastucture/persistence/repositories/prediction-event.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonalPrediction,PredictionEvent]), 
    forwardRef(() => AuthModule),
    forwardRef(() => GroupModule),
    forwardRef(() => MatchModule),
    forwardRef(() => UserModule),
    forwardRef(() => PredictionAuditModule),
    PlayerModule
  ],
  providers: [PersonalPredictionService, UserValidationService, PredictionEventService,PersonalPredictionRepository,PredictionEventRepository],
  controllers: [PersonalPredictionController], 
  exports: [PersonalPredictionService,PersonalPredictionRepository,PredictionEventRepository,PredictionEventService],
})
export class PersonalPredictionModule {}