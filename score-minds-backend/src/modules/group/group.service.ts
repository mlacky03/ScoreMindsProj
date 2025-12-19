import { Repository } from "typeorm";
import { Injectable, Inject, forwardRef, ForbiddenException } from "@nestjs/common";
import { GroupUserService } from "../group-user/group-user.service";
import { Group } from "./group.entity";
import { GroupUser } from "../group-user/group-user.entity";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { group } from "console";
import { BaseService } from "src/common/services/base.service";
import { BaseGroupUserDto } from "../group-user/dto/BaseGroupMember.dto";
import { BaseGroupDto } from "./dto/base-group.dto";
import { COMMON_SELECT_FIELDS, getSelectFields } from "src/common/constants/pagination.constants";
import { FullGroupDto } from "./dto/full-group.dto";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import { BaseExceptionFilter } from "@nestjs/core";
import { GroupNotFoundException, UserNotFoundException } from "src/common/exceptions/all.exceptions";
import { BaseUserDto } from "../user/dto/base-user.dto";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Injectable()
export class GroupService extends BaseService<Group> {
    constructor(
        @InjectRepository(Group)
        private readonly repo: Repository<Group>,
        private readonly groupUserService: GroupUserService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,

    ) {
        super(repo);
    }

    async findAll(memberId: number): Promise<BaseGroupDto[]> {
        const groups = await this.repo.createQueryBuilder('group')
            .select(getSelectFields('group', COMMON_SELECT_FIELDS.GROUP))
            .innerJoinAndSelect('group.members', 'members')
            .where('members.user_id=:memberId', { memberId })
            .getMany();

        return groups.map(g => new BaseGroupDto(g));
    }

    async findOne(userId: number, groupId: number): Promise<FullGroupDto> {
        if (!(await this.chackMembership(userId, groupId))) {
            throw new ForbiddenException("You do not have access to this resource");
        }

        const group = await this.repo.createQueryBuilder('group')
            .select(getSelectFields('group', COMMON_SELECT_FIELDS.GROUP))
            .addSelect(getSelectFields('memberUser', COMMON_SELECT_FIELDS.USER))
            .leftJoinAndSelect('group.members', 'members')
            .leftJoinAndSelect('members.user', 'memberUser')
            .where('group.id=:groupId', { groupId })
            .getOne()

        if (!group) {
            throw new GroupNotFoundException(groupId);
        }

        const owner = await this.userService.findOne(group.ownerId);
        const groupS = new FullGroupDto(group);
        groupS.owner = new BaseUserDto(owner);
        return groupS;

    }

    async chackMembership(userId: number, groupId: number): Promise<boolean> {
        const gs = await this.groupUserService.getMemberById(userId, groupId);
        if (!gs) {
            return false;
        }

        return true;
    }

    async chackOwnership(userId: number, groupId: number): Promise<boolean> {
        const group = await this.repo.findOne({ where: { id: groupId, ownerId: userId }, });

        return !!group;
    }

    async create(data: CreateGroupDto, userId: number): Promise<Group> {
        const newGroup = this.repo.create(data);
        newGroup.ownerId = userId;
        await this.repo.save(newGroup);
        await this.groupUserService.addMemberToGroup(userId, newGroup.id);
        return newGroup;
    }

    async addMemberToGroup(groupId: number, userId: number): Promise<GroupUser> {
        const group = await this.repo.findOne({ where: { id: groupId } });
        if (!group) {
            throw new GroupNotFoundException(groupId);
        }

        return this.groupUserService.addMemberToGroup(userId, groupId);
    }

    async updateCover(groupId: number, imagePath: string): Promise<void> {
        const group = await this.repo.findOne({ where: { id: groupId } });

        if (!group) {
            throw new GroupNotFoundException(groupId);
        }

        await this.repo.update({ id: groupId }, { profileImageUrl: imagePath });
    }

    async update(id: number, data: UpdateGroupDto): Promise<BaseGroupDto> {
        const group = await this.repo.findOneBy({ id });

        if (!group) {
            throw new GroupNotFoundException(id);
        }

        Object.assign(group, data);
        const updateGroup = await this.repo.save(group);
        return new BaseGroupDto(updateGroup);
    }

}