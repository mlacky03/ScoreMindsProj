import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { GroupUser } from "src/domain/models/group-user.model";
import { AppGateway } from "src/gateway/app.gateway";
import { GroupUserRepository } from "src/infrastucture/persistence/repositories/group-user.repository";

@Controller()
export class GroupUserWorker {
    constructor(
        private readonly AppGateway:AppGateway
    ){}

    @EventPattern('add_member_to_group')
    async handleAddMemberToGroup(@Payload() data: any) {
       this.AppGateway.brodcastUserAddedToGroup(data.userId,data.groupId);
    }

    
}