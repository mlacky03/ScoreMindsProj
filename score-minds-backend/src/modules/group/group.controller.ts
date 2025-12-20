
import {
    BadRequestException,
    Body,
    Controller,
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
import { GroupService } from "./group.service";
import { BaseGroupDto } from "./dto/base-group.dto";
import { Group } from "./group.entity";
import { CreateGroupDto } from "./dto/create-group.dto";
import { GroupUser } from "../group-user/group-user.entity";
import { BaseGroupUserDto } from "../group-user/dto/BaseGroupMember.dto";
import { GroupUserService } from "../group-user/group-user.service";
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../storage/storage.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PAGINATION } from '../../common/constants/pagination.constants';
import { IsAlpha, Max } from 'class-validator';
import { fileURLToPath } from 'url';
import { ApiTags } from '@nestjs/swagger';


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

        if (group.members) {
            group.members = group.members.map((m) => ({
                ...m,
                user: {
                    ...m.user,
                    profileImageUrl: m.user.profileImageUrl ? this.storage.getPublicUrl(m.user.profileImageUrl) : undefined

                }
            })

            );
        }

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
    ): Promise<Group> {
        const create = await this.groupService.create(group, userId);

        if (image) {
            const { path } = await this.storage.uploadGroupCover(create.id, image);
            this.groupService.updateCover(create.id, path);
        }

        return create;

    }


    @UseGuards(JwtAuthGuard)
    @Post(':group_id/new-member/:member_id')
    async addMemberToGroup(
        @CurrentUser() curentId: number,
        @Param('group_id') groupId: string,
        @Param('member_id') userId: string): Promise<GroupUser> {
        if (isNaN(+groupId) || isNaN(+userId)) {
            throw new BadRequestException('Invalid group or member ID')
        }

        const validation = await this.groupService.chackMembership(curentId, +groupId);

        if (!validation) {
            throw new ForbiddenException('You do not have permission to add members to this group',)
        }

        const exist = await this.groupService.chackMembership(+userId, +groupId);
        if (exist) {
            throw new BadRequestException(
                'User is already a member of this group',
            );
        }


        return await this.groupService.addMemberToGroup(+groupId, +userId);

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
        const validated = await this.groupService.chackMembership(currentId, +groupId);
        if (!validated) {
            throw new ForbiddenException(
                'You do not have permission to update this group',
            );
        }

        const updated= await this.groupService.update(+groupId,data);

        if(image)
        {
            const {path}= await this.storage.uploadGroupCover(+groupId,image);
            await this.groupService.updateCover(+groupId,path);
        }

        return updated;
    }


}