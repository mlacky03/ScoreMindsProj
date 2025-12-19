import { Module } from "@nestjs/common";
import { Match } from "./matches.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth-module/auth.module";
import { MatchService } from "./matches.service";
import { MatchController } from "./matches.controller";
import { StorageService } from "../storage/storage.service";
import { UserValidationService } from "src/common/services/user-validation.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]), 
    forwardRef(() => AuthModule),
    
  ],
  providers: [MatchService,StorageService,UserValidationService],
  controllers: [MatchController], 
  exports: [MatchService],
})
export class MatchModule {}