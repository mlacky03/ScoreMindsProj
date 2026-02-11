import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SyncService } from '../application/services/sync.service';
import { SyncController } from '../presentation/controllers/sync.controller';
import { FootballApiService } from 'src/common/services/football-api.service';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { UserModule } from './user.module';
import { ConfigModule } from '@nestjs/config';
import { Adapter } from 'src/common/patterns/Adapter';
import { AuthModule } from './auth.module';
import { RabbitMQModule } from 'src/infrastucture/messaging/rabbitmq.module';
import { MatchModule } from './matches.module';
import { SyncWorker } from 'src/presentation/workers/sync.worker';
import { PlayerModule } from './player.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    HttpModule, 
    ConfigModule,
    AuthModule,
    RabbitMQModule,
    MatchModule,
    PlayerModule,
    UserModule,
    ScheduleModule.forRoot(),
    RabbitMQModule
  ],
  controllers: [SyncController,SyncWorker],
  providers: [SyncService, FootballApiService,UserValidationService,Adapter],
  exports:[SyncService]
})
export class SyncModule {}