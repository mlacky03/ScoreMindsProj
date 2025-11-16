import { Module } from "@nestjs/common";
import { GroupUserService } from "./group-user.service";
import { GroupUserController } from "./group-user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupUser } from "./group-user.entity";

@Module({
    imports:[
        TypeOrmModule.forFeature([GroupUser])
    ],
    providers:[GroupUserService],
    controllers:[GroupUserController],
    exports:[GroupUserService],
})

export class GroupUserModule {};