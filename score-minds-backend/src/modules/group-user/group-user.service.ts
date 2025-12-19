import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupUser } from "./group-user.entity";
import { Repository } from "typeorm";
import { BaseGroupUserDto } from "./dto/BaseGroupMember.dto";

@Injectable()
export class GroupUserService
{
    constructor(
        @InjectRepository(GroupUser)
        private readonly repo: Repository<GroupUser>
    ) {
        
    }

    async findAll():Promise<GroupUser []>
    {
        return this.repo.find();
    }    

    async findOne(id:number) :Promise<GroupUser|null>
    {
        
        return this.repo.findOne({where:{id},
                                    relations:['user','group']});
    }

    async addMemberToGroup(
        userId:number,
        groupId:number
    ):Promise<GroupUser >
    {
        const member= this.repo.create({groupId,userId});

        return this.repo.save(member);

    }

    async getGroupMembers(groupId:number):Promise<GroupUser[]>
    {
        const members= await this.repo
            .createQueryBuilder('group_user')
            .leftJoinAndSelect('group_user.user','user')
            .where('group_user.groupId=:groupId',{groupId})
            .getMany();
        return  members;
    }

    async getMemberById(userId:number, groupId:number) :Promise<GroupUser|null>
    {
        return this.repo.findOne({where:{groupId,userId},});
    }

    async deleteGroupMember(id:number) :Promise<void>
    {
        await this.repo.delete(id);
    }


}