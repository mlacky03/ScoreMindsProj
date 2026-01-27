
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../infrastucture/persistence/entities/user.entity';
import { UserService } from '../application/services/user.service';
import { UserController } from '../presentation/controllers/user.controller';
import { AuthModule } from './auth.module';
import { StorageService } from '../application/services/storage.service';
import { UserValidationService } from '../common/services/user-validation.service';
import { GroupModule } from './group.module';
import { UserWorker } from 'src/presentation/workers/user.worker';
import { UserRepository } from 'src/infrastucture/persistence/repositories/user.repository';
import { RabbitMQModule } from 'src/infrastucture/messaging/rabbitmq.module';
import { GroupUserModule } from './group-user.module';
import { PersonalPredictionModule } from './personal-predictition.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => AuthModule),
    forwardRef(() => GroupModule),
    forwardRef(() => GroupUserModule),
    forwardRef(() => PersonalPredictionModule),
    RabbitMQModule
  ],
  providers: [UserService, StorageService, UserValidationService,UserRepository],
  controllers: [UserController,UserWorker], 
  exports: [UserService,UserRepository],
})
export class UserModule {}