import { Player } from "./player.entity";
import { AuthModule } from "../auth-module/auth.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { PlayerService } from "./player.service";
import { PlayerController } from "./player.controller";
import {StorageService} from "../storage/storage.service";
import { UserValidationService } from "src/common/services/user-validation.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([Player]), 
    forwardRef(() => AuthModule),
    
  ],
  providers: [PlayerService,StorageService,UserValidationService],
  controllers: [PlayerController], 
  exports: [PlayerService],
})
export class PlayerModule {}