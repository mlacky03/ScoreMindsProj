import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPredictionService } from 'src/application/services/group-prediction.service';
import { PredictionEvent } from 'src/domain/models/prediction-event.model';
import { GroupPrediction } from 'src/infrastucture/persistence/entities/group-prediction.entity';
import { UserModule } from './user.module';
import { GroupModule } from './group.module';
import { MatchModule } from './matches.module';
import { AuthModule } from './auth.module';
import { GroupPredictionRepository } from 'src/infrastucture/persistence/repositories/group-prediction.repository';

@Module({
    imports: [TypeOrmModule.forFeature([GroupPrediction,PredictionEvent]),
    forwardRef(() => UserModule),
    forwardRef(() => GroupModule),
    forwardRef(() => MatchModule),
    forwardRef(() => AuthModule)
    ],
    controllers: [GroupPredictionModule],
    providers: [GroupPredictionService,GroupPredictionRepository],
    exports: [GroupPredictionService,GroupPredictionRepository],
})
export class GroupPredictionModule { }