import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPredictionService } from 'src/application/services/group-prediction.service';

import { GroupPrediction } from 'src/infrastucture/persistence/entities/group-prediction.entity';
import { UserModule } from './user.module';
import { GroupModule } from './group.module';
import { MatchModule } from './matches.module';
import { AuthModule } from './auth.module';
import { GroupPredictionRepository } from 'src/infrastucture/persistence/repositories/group-prediction.repository';
import { Group } from 'src/domain/models/group.model';
import { PredictionEventService } from 'src/application/services/prediction-event.service';
import { PredictionAudit } from 'src/domain/models/prediction-audit.model';
import { PredictionAuditModule } from './prediction-audit.module';
import { PlayerModule } from './player.module';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { PredictionEventRepository } from 'src/infrastucture/persistence/repositories/prediction-event.repository';
import { GroupPredictionController } from 'src/presentation/controllers/group-prediction.controller';
import { PredictionEvent } from 'src/infrastucture/persistence/entities/prediction-event.entity';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPrediction,PredictionEvent]),
    forwardRef(() => UserModule),
    forwardRef(() => GroupModule),
    forwardRef(() => MatchModule),
    forwardRef(() => AuthModule),
    forwardRef(()=>PlayerModule),
    forwardRef(()=>GroupModule),
    forwardRef(()=>PredictionAuditModule)
    ],
    controllers: [GroupPredictionController],
    providers: [GroupPredictionService,GroupPredictionRepository,PredictionEventService,UserValidationService,PredictionEventRepository ],
    exports: [GroupPredictionService,GroupPredictionRepository],
})
export class GroupPredictionModule { }