import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Match } from '../matches/matches.entity'; 
import { Player } from '../players/player.entity'; 
import { FootballApiService } from 'src/common/services/football-api.service';
import { UserValidationService } from 'src/common/services/user-validation.service';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { Adapter } from 'src/common/patterns/Adapter';

@Module({
  imports: [
    HttpModule, 
    ConfigModule,
    TypeOrmModule.forFeature([Match, Player]), 
    forwardRef(()=>UserModule)
  ],
  controllers: [SyncController],
  providers: [SyncService, FootballApiService,UserValidationService,Adapter],
  exports:[SyncService]
})
export class SyncModule {}