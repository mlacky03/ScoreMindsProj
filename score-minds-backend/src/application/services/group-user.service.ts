import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { GroupUser } from "src/domain/models/group-user.model";
import { GroupUserRepository } from "src/infrastucture/persistence/repositories/group-user.repository";
import { BaseGroupUserDto } from "../dtos/group-user-dto/BaseGroupMember.dto";

@Injectable()
export class GroupUserService {
    constructor(
        @Inject(GroupUserRepository)
        private readonly repo: GroupUserRepository,
        @Inject('RABBITMQ_SERVICE')
        private readonly rabbitClient: ClientProxy,
    ) {

    }

    async findAll(): Promise<GroupUser[]> {
        return this.repo.findAll();
    }

    async findOne(id: number): Promise<GroupUser | null> {

        return this.repo.findById(id);
    }

    async addMemberToGroup(
        userId: number,
        groupId: number
    ): Promise<BaseGroupUserDto> {
       
        const groupUser = new GroupUser(
            null,
            groupId,
            userId,
            new Date()
        );
        const savedGroupUser=await this.repo.save(groupUser)

        return new BaseGroupUserDto(savedGroupUser);
    }

    async getGroupMembers(groupId: number): Promise<BaseGroupUserDto[]> {
        const members = await this.repo.findByGroupId(groupId);
        return members.map(m=>new BaseGroupUserDto(m));
    }

    async getMemberById(userId: number, groupId: number): Promise<GroupUser | null> {
        return this.repo.findUserGroup(userId, groupId);
    }

    async getMemberGroups(userId: number): Promise<GroupUser[]> {
        return this.repo.findByUserId(userId);
    }

    async deleteGroupMember(id: number): Promise<{message:string}> {

        await this.repo.delete(id);
        return {message:"Member deleted from group successfully"};
    }


}