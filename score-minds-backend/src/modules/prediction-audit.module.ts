import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { UserModule } from './user.module';

import { PredictionAuditService } from 'src/application/services/prediction-audit.service';
import { PredictionAuditController } from 'src/presentation/controllers/prediction-audit.controller';
import { PredictionAudit } from 'src/infrastucture/persistence/entities/prediction-audit.entity';

import { PersonalPredictionModule } from './personal-predictition.module';
import { PredictionAuditRepository } from 'src/infrastucture/persistence/repositories/prediction-audit';

@Module({
  imports: [
    TypeOrmModule.forFeature([PredictionAudit]), 
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => PersonalPredictionModule),

  ],
  providers: [PredictionAuditService, UserValidationService,PredictionAuditRepository],
  controllers: [PredictionAuditController], 
  exports: [PredictionAuditService,PredictionAuditRepository],
})
export class PredictionAuditModule {}