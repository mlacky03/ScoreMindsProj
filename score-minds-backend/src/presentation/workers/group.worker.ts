import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern, Payload } from "@nestjs/microservices";
import { Group } from "src/domain/models/group.model";
import { GroupRepository } from "src/infrastucture/persistence/repositories/group.repository";


@Controller()
export class GroupWorker {

    constructor(
        private readonly groupRepo: GroupRepository
    ) { }


    @MessagePattern('create_group')
    async handleCreateGroup(@Payload() data: any) {
        const newGroup = new Group(
            null,
            data.name,
            data.ownerId,
            new Date(),
            data.profileImageUrl || null
        );

        try {

            const createdGroup = await this.groupRepo.createGroupWithOwner(newGroup, data.ownerId);

            return { success: true, id: createdGroup.id };
        } catch (e) {
            console.error('Greška pri kreiranju grupe:', e);
            return { error: e.message };
        }
    }

    @EventPattern('update_group_cover')
    async handleUpdateGroupCover(@Payload() data: any) {
        const group = await this.groupRepo.findById(data.groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        group.updateProfileImage(data.imagePath);
        await this.groupRepo.save(group);
    }

    @EventPattern('update_group')
    async handleUpdateGroupName(@Payload() data: any) {
        const group = await this.groupRepo.findById(data.groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        group.updateGroup(data.name, data.profileImageUrl);
        await this.groupRepo.save(group);
    }

    @EventPattern('delete_group')
    async handleDeleteGroup(@Payload() data: any) {

        await this.groupRepo.delete(data.groupId);
    }
}
