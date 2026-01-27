import { Module } from "@nestjs/common";
import { Match } from "src/infrastucture/persistence/entities/matches.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { AuthModule } from "./auth.module";
import { MatchService } from "src/application/services/matches.service";
import { MatchController } from "src/presentation/controllers/matches.controller";
import { UserValidationService } from "src/common/services/user-validation.service";
import { UserModule } from "./user.module";
import { MatchRepository } from "src/infrastucture/persistence/repositories/match.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]), 
    forwardRef(()=>AuthModule),
    forwardRef(()=>UserModule)
  ],
  providers: [MatchService,UserValidationService,MatchRepository],
  controllers: [MatchController], 
  exports: [MatchService,MatchRepository],
})
export class MatchModule {}