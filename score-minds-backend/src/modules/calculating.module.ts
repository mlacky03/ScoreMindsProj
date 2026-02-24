import { forwardRef, Module } from '@nestjs/common';

import { CalculatingWorker } from 'src/presentation/workers/calculating.worker'; 
import { CalculatingService } from 'src/application/services/calculating.service';

import { MatchModule } from './matches.module';
import { PersonalPredictionModule } from './personal-predictition.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { GatewayModule } from './app-gateway.module';
import { RabbitMQModule } from 'src/infrastucture/messaging/rabbitmq.module';
import { GroupPredictionModule } from './group-prediction.module';


@Module({
  imports: [
    MatchModule,
    forwardRef(() => PersonalPredictionModule),
    forwardRef(()=>GroupPredictionModule),
    UserModule,
    AuthModule,
    forwardRef(() => GatewayModule),
    RabbitMQModule
  ],
  controllers: [
    CalculatingWorker 
  ],
  providers: [
    CalculatingService, 
    UserValidationService,

  ],
})
export class CalculatingModule {}