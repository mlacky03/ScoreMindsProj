import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { GroupUser } from "src/domain/models/group-user.model";
import { GroupUserRepository } from "src/infrastucture/persistence/repositories/group-user.repository";

@Controller()
export class GroupUserWorker {
    constructor(
        private readonly groupUserRepo: GroupUserRepository
    ){}

    @EventPattern('add_member_to_group')
    async handleAddMemberToGroup(@Payload() data: any) {
        const { userId, groupId } = data;
        const groupUser = new GroupUser(
            null,
            userId,
            groupId,
            new Date()
        );
        await this.groupUserRepo.save(groupUser);

    }

    @EventPattern('delete_group_user')
    async handleDeleteGroupUser(@Payload() data: any) {
        const { id } = data;
        await this.groupUserRepo.delete(id);
    }
}