import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPredictionService } from 'src/application/services/group-prediction.service';

import { GroupPrediction } from 'src/infrastucture/persistence/entities/group-prediction.entity';
import { UserModule } from './user.module';
import { GroupModule } from './group.module';
import { MatchModule } from './matches.module';
import { AuthModule } from './auth.module';
import { GroupPredictionRepository } from 'src/infrastucture/persistence/repositories/group-prediction.repository';
import { PredictionEventService } from 'src/application/services/prediction-event.service';
import { PredictionAuditModule } from './prediction-audit.module';
import { PlayerModule } from './player.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { PredictionEventRepository } from 'src/infrastucture/persistence/repositories/prediction-event.repository';
import { GroupPredictionController } from 'src/presentation/controllers/group-prediction.controller';
import { PredictionEvent } from 'src/infrastucture/persistence/entities/prediction-event.entity';
import { RabbitMQModule } from 'src/infrastucture/messaging/rabbitmq.module';
import { PredictionWorker } from 'src/presentation/workers/prediction.worker';
import { GatewayModule } from './app-gateway.module';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPrediction,PredictionEvent]),
    forwardRef(() => UserModule),
    forwardRef(() => GroupModule),
    forwardRef(() => MatchModule),
    forwardRef(() => AuthModule),
    forwardRef(()=>PlayerModule),
    forwardRef(()=>GroupModule),
    forwardRef(()=>PredictionAuditModule),
    forwardRef(()=>RabbitMQModule),
    forwardRef(()=>GatewayModule
)
    ],
    controllers: [GroupPredictionController,PredictionWorker],
    providers: [GroupPredictionService,GroupPredictionRepository,PredictionEventService,UserValidationService,PredictionEventRepository ],
    exports: [GroupPredictionService,GroupPredictionRepository],
})
export class GroupPredictionModule { }