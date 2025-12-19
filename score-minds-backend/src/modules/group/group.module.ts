import { Module,forwardRef } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Group } from "./group.entity";
import { User } from "../user/user.entity";
import { UserModule } from "../user/user.module";
import { GroupUser } from "../group-user/group-user.entity";
import { GroupUserService } from "../group-user/group-user.service";
import { StorageService } from "../storage/storage.service";
import { UserValidationService } from "src/common/services/user-validation.service";
import { Type } from "class-transformer";

@Module({
    imports:[
        TypeOrmModule.forFeature([Group]),
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([GroupUser]),
        forwardRef(()=>UserModule)
    ],
    controllers:[GroupController],
    providers:[
        GroupService,
        GroupUserService,
        StorageService,
        UserValidationService
    ],
    exports:[GroupService]

})
export class GroupModule{} 