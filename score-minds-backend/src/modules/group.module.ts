import { Module,forwardRef } from "@nestjs/common";
import { GroupController } from "src/presentation/controllers/group.controller";
import { GroupService } from "src/application/services/group.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Group } from "src/infrastucture/persistence/entities/group.entity";
import { UserModule } from "./user.module";
import { StorageService } from "src/application/services/storage.service";
import { UserValidationService } from "src/common/services/user-validation.service";
import { GroupRepository } from "src/infrastucture/persistence/repositories/group.repository";
import { GroupWorker } from "src/presentation/workers/group.worker";
import { RabbitMQModule } from "src/infrastucture/messaging/rabbitmq.module";
import { GroupUserModule } from "./group-user.module";

@Module({
    imports:[
        TypeOrmModule.forFeature([Group]),
        forwardRef(()=>UserModule),
        GroupUserModule,
        RabbitMQModule
    ],
    controllers:[GroupController,GroupWorker],
    providers:[
        GroupService,
        StorageService,
        UserValidationService,
        GroupRepository
    ],
    exports:[GroupService,GroupRepository]

})
export class GroupModule{} 