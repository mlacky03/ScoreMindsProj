import { Player } from "src/infrastucture/persistence/entities/player.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { PlayerService } from "src/application/services/player.service";
import { PlayerController } from "src/presentation/controllers/player.controller";
import { StorageService } from "src/application/services/storage.service";
import { UserValidationService } from "src/common/services/user-validation.service";
import { UserModule } from "./user.module";
import { AuthModule } from "./auth.module";
import { PlayerRepository } from "src/infrastucture/persistence/repositories/player.repository";
@Module({
  imports: [
    TypeOrmModule.forFeature([Player]), 
    forwardRef(()=>AuthModule),
    forwardRef(()=>UserModule)
    
  ],
  providers: [PlayerService,UserValidationService,PlayerRepository],
  controllers: [PlayerController], 
  exports: [PlayerService,PlayerRepository],
})
export class PlayerModule {}