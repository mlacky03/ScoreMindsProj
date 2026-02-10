import { Injectable, Inject, forwardRef, ForbiddenException, BadRequestException } from "@nestjs/common";
import { GroupUserService } from "./group-user.service";
import { Group } from "src/domain/models/group.model";
import { UserService } from "./user.service";
import { BaseGroupDto } from "../dtos/group-dto/base-group.dto";
import { COMMON_SELECT_FIELDS, getSelectFields } from "src/common/constants/pagination.constants";
import { FullGroupDto } from "../dtos/group-dto/full-group.dto";
import { GroupNotFoundException, UserNotFoundException } from "src/common/exceptions/all.exceptions";
import { BaseUserDto } from "../dtos/user-dto/base-user.dto";
import { CreateGroupDto } from "../dtos/group-dto/create-group.dto";
import { UpdateGroupDto } from "../dtos/group-dto/update-group.dto";
import { GroupRepository } from "src/infrastucture/persistence/repositories/group.repository";
import { ClientProxy } from "@nestjs/microservices";
import { BaseGroupUserDto } from "../dtos/group-user-dto/BaseGroupMember.dto";

@Injectable()
export class GroupService  {
    constructor(
        @Inject(GroupRepository)
        private readonly repo: GroupRepository,
        private readonly groupUserService: GroupUserService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject('RABBITMQ_SERVICE')
        private readonly rabbitClient: ClientProxy,

    ) {
        
    }

    async findAll(memberId: number): Promise<BaseGroupDto[]> {
        const groups= await this.repo.findByOwner(memberId);

        return groups.map(g => new BaseGroupDto(g));
    }

    async findOne(userId: number, groupId: number): Promise<FullGroupDto> {
        if (!(await this.chackMembership(userId, groupId))) {
            throw new ForbiddenException("You do not have access to this resource");
        }

        const group = await this.repo.findById(groupId);
        const members = await this.groupUserService.getGroupMembers(groupId);

        if (!group) {
            throw new GroupNotFoundException(groupId);
        }
        //members.map(m=>console.log(m.user.profileImageUrl))
        const owner = await this.userService.findOne(group.ownerId);
        const groupS = new FullGroupDto(group, members);
        groupS.owner = new BaseUserDto(owner);
        return groupS;

    }

    async chackMembership(userId: number, groupId: number): Promise<boolean> {
        const gs = await this.groupUserService.getMemberById(userId, groupId);
        if (!gs) {
            throw new ForbiddenException("You do not have access to this resource");
        }

        return true;
    }


    async create(data: CreateGroupDto, userId: number): Promise<FullGroupDto> {
        const owner= await this.userService.findOne(userId);
        if (!owner) {
            throw new UserNotFoundException(userId);
        }
        
        const group=new Group(
            null,
            data.name,
            userId,
            new Date(),
            data.profileImageUrl
        )
       const createGroup=await this.repo.save(group);
       const groupUser=await this.groupUserService.addMemberToGroup( userId,createGroup.id!);
       

        return new FullGroupDto(createGroup, [groupUser]);
    }

    async addMemberToGroup(groupId: number, userId: number,adminId:number): Promise<BaseGroupUserDto> {
        const group = await this.repo.findById(groupId);
        if (!group) {
            throw new GroupNotFoundException(groupId);
        }
        const validated = await this.chackMembership(adminId, groupId);
        if (!validated) {
            throw new ForbiddenException("You do not have permission to add members to this group");
        }

        const memberExists = await this.groupUserService.getMemberById(userId, groupId);
        if (memberExists) {
            throw new BadRequestException("User is already a member of this group");
        }

        return this.groupUserService.addMemberToGroup(userId, groupId);
    }

    async updateCover(groupId: number, imagePath: string): Promise<BaseGroupDto> {
        const group = await this.repo.findById(groupId);

        if (!group) {
            throw new GroupNotFoundException(groupId);
        }

        group.updateProfileImage(imagePath);
        const updatedGroup=await this.repo.save(group);

        return new BaseGroupDto(updatedGroup);
    }

    async update(id: number, data: UpdateGroupDto,userId:number): Promise<BaseGroupDto> {
        const group = await this.repo.findById(id);

        if (!group) {
            throw new GroupNotFoundException(id);
        }
        const validated = await this.chackMembership(group.ownerId, userId);
        if (!validated) {
            throw new ForbiddenException("You do not have permission to update this group");
        }

        group.updateGroup(data.name!, data.profileImageUrl!);
        const updatedGroup=await this.repo.save(group);

        return new BaseGroupDto(updatedGroup);
    }

    async kickMemberFromGroup(memberId:number,groupId:number,adminId:number): Promise<{message:string}> {
        const group = await this.repo.findById(groupId);
        if (!group) {
            throw new GroupNotFoundException(groupId);
        }
        if(group.ownerId!==adminId){
            throw new ForbiddenException("You do not have permission to kick this member");
        }
        const gs = await this.groupUserService.getMemberById(memberId, groupId);
        if (!gs) {
            throw new Error("Member not found in group");
        }

        return this.groupUserService.deleteGroupMember(gs.id!);
    }
    async delete(id: number,adminId:number): Promise<{message:string}> {
        const group = await this.repo.findById(id);

        if (!group) {
            throw new GroupNotFoundException(id);
        }

        if(group.ownerId!==adminId){
            throw new ForbiddenException("You do not have permission to delete this group");
        }

        await this.repo.delete(id);
        return {message:"Group deleted successfully"};
    }

}