import { forwardRef, Module } from "@nestjs/common";
import { GroupUserService } from "src/application/services/group-user.service";
import { GroupUserController } from "src/presentation/controllers/group-user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupUser } from "src/infrastucture/persistence/entities/group-user.entity";
import { RabbitMQModule } from "src/infrastucture/messaging/rabbitmq.module";
import { GroupUserRepository } from "src/infrastucture/persistence/repositories/group-user.repository";
import { GroupUserWorker } from "src/presentation/workers/group-user.worker";
import { UserService } from "src/application/services/user.service";
import { UserModule } from "./user.module";
import { StorageService } from "src/application/services/storage.service";

@Module({
    imports:[
        TypeOrmModule.forFeature([GroupUser]),
        forwardRef(() => UserModule),
        
        RabbitMQModule
    ],
    providers:[GroupUserService,GroupUserRepository,StorageService],
    controllers:[GroupUserController,GroupUserWorker],
    exports:[GroupUserService,GroupUserRepository],
})

export class GroupUserModule {};