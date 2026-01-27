
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    ForbiddenException,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { GroupService } from "../../application/services/group.service";
import { BaseGroupDto } from 'src/application/dtos/group-dto/base-group.dto';
import { Group } from "../../infrastucture/persistence/entities/group.entity";
import { CreateGroupDto } from 'src/application/dtos/group-dto/create-group.dto';
import { GroupUser } from "../../infrastucture/persistence/entities/group-user.entity";
import { BaseGroupUserDto } from "../../application/dtos/group-user-dto/BaseGroupMember.dto";
import { GroupUserService } from "../../application/services/group-user.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../../application/services/storage.service';
import { UpdateGroupDto } from 'src/application/dtos/group-dto/update-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PAGINATION } from '../../common/constants/pagination.constants';
import { ApiTags } from '@nestjs/swagger';
import { FullGroupDto } from 'src/application/dtos/group-dto/full-group.dto';

@ApiTags('Groups')
@Controller('groups')
export class GroupController {
    constructor(
        private readonly groupService: GroupService,
        private readonly groupUserService: GroupUserService,
        private readonly storage: StorageService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@CurrentUser() id: number): Promise<BaseGroupDto[]> {
        const groups = await this.groupService.findAll(id);

        return groups.map(g => ({
            ...g,
            profileImageUrl: g.profileImageUrl ? this.storage.getPublicUrl(g.profileImageUrl) : undefined,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@CurrentUser() userId: number, @Param('id') groupId: string) {
        const group = await this.groupService.findOne(userId, +groupId);

        if (group.profileImageUrl) {
            group.profileImageUrl = this.storage.getPublicUrl(group.profileImageUrl);
        }

        // if (group.members) {
        //     group.members = group.members.map((m) => ({
        //         ...m,
        //         user: {
        //             ...m.user,
        //             profileImageUrl: m.user.profileImageUrl ? this.storage.getPublicUrl(m.user.profileImageUrl) : undefined

        //         }
        //     })

        //     );
        // }

        return group;


    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: { fileSize: PAGINATION.MAX_LIMIT * 1024 * 1024 },
        })
    )
    @Post('create')
    async create(
        @CurrentUser() userId: number,
        @Body(ValidationPipe) group: CreateGroupDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: PAGINATION.MAX_LIMIT * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
                ],
            })
        ) image?: Express.Multer.File,
    ): Promise<FullGroupDto> {
        const created=await this.groupService.create(group, userId);

        if(image)
        {
            const {path}= await this.storage.uploadGroupCover(created.id,image);
            await this.groupService.updateCover(created.id,path);
        }

        return created;

    }


    @UseGuards(JwtAuthGuard)
    @Post(':group_id/new-member/:member_id')
    async addMemberToGroup(
        @CurrentUser() curentId: number,
        @Param('group_id') groupId: string,
        @Param('member_id') userId: string): Promise<BaseGroupUserDto> {
        if (isNaN(+groupId) || isNaN(+userId)) {
            throw new BadRequestException('Invalid group or member ID')
        }

        return await this.groupService.addMemberToGroup(+groupId, +userId,curentId);

    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/members')
    async getMembers(
        @CurrentUser() userId: number,
        @Param('id') groupId: string,
    ): Promise<BaseGroupUserDto[]> {
        const validated = await this.groupService.chackMembership(userId, +groupId);
        if (!validated) {
            throw new ForbiddenException(
                'You have to be a member of the group to see its members',
            );
        }

        return this.groupUserService.getGroupMembers(+groupId);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: { fileSize: PAGINATION.MAX_LIMIT * 1024 * 1024 },
        }),
    )
    @Patch(':id')
    async updateGroup(
        @CurrentUser() currentId: number,
        @Param('id') groupId: string,
        @Body(ValidationPipe) data: UpdateGroupDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators:
                    [
                        new MaxFileSizeValidator({ maxSize: PAGINATION.MAX_LIMIT * 1024 * 1024 }),
                        new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                    ]
            })
        ) image: Express.Multer.File

    ): Promise<BaseGroupDto> {

        const updated= await this.groupService.update(+groupId,data,currentId);

        if(image)
        {
            const {path}= await this.storage.uploadGroupCover(+groupId,image);
            return await this.groupService.updateCover(+groupId,path);
        }

        return updated;
    }

    @UseGuards(JwtAuthGuard)
    @Delete('kick_member/:memberId/:groupId')
    async kickMember(@Param('memberId') memberId: number, @Param('groupId') groupId: number,@CurrentUser() adminId:number) :Promise<{message:string}>{
        return await this.groupService.kickMemberFromGroup(memberId, groupId, adminId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete_group/:id')
    async deleteGroup(@Param('id') id: number,@CurrentUser() adminId:number): Promise<{message:string}> {
        return await this.groupService.delete(id,adminId);
    }
}