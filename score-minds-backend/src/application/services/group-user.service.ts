import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { GroupUser } from "src/domain/models/group-user.model";
import { GroupUserRepository } from "src/infrastucture/persistence/repositories/group-user.repository";
import { BaseGroupUserDto } from "../dtos/group-user-dto/BaseGroupMember.dto";
import { UserService } from "./user.service";
import { BaseUserDto } from "../dtos/user-dto/base-user.dto";
import { StorageService } from "./storage.service";

@Injectable()
export class GroupUserService {
    constructor(
        @Inject(GroupUserRepository)
        private readonly repo: GroupUserRepository,
        @Inject('RABBITMQ_SERVICE')
        private readonly rabbitClient: ClientProxy,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private storageService: StorageService

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
        const savedGroupUser = await this.repo.save(groupUser)
        const user= await this.userService.findOne(userId);
        return new BaseGroupUserDto(savedGroupUser, new BaseUserDto(user));
    }

    async getGroupMembers(groupId: number): Promise<BaseGroupUserDto[]> {
        const members = await this.repo.findByGroupId(groupId);
        const promiseList = members.map(async (m) => {
        const user = await this.userService.findOne(m.userId);
        user.profileImageUrl=user.profileImageUrl?this.storageService.getPublicUrl(user.profileImageUrl):undefined;
        return new BaseGroupUserDto(m, new BaseUserDto(user));
    });
        return Promise.all(promiseList);
    }

    async getMemberById(userId: number, groupId: number): Promise<GroupUser | null> {
        return this.repo.findUserGroup(userId, groupId);
    }

    async getMemberGroups(userId: number): Promise<GroupUser[]> {
        return this.repo.findByUserId(userId);
    }

    async deleteGroupMember(id: number): Promise<{ message: string }> {

        await this.repo.delete(id);
        return { message: "Member deleted from group successfully" };
    }


}