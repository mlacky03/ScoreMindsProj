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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { GroupService } from 'src/application/services/group.service';
import { BaseGroupDto } from 'src/application/dtos/group-dto/base-group.dto';
import { Group } from 'src/infrastucture/persistence/entities/group.entity';
import { CreateGroupDto } from 'src/application/dtos/group-dto/create-group.dto';
import { GroupUser } from 'src/infrastucture/persistence/entities/group-user.entity';
import { BaseGroupUserDto } from 'src/application/dtos/group-user-dto/BaseGroupMember.dto';
import { GroupUserService } from 'src/application/services/group-user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../../application/services/storage.service';
import { UpdateGroupDto } from 'src/application/dtos/group-dto/update-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PAGINATION } from '../../common/constants/pagination.constants';
import { FullGroupDto } from 'src/application/dtos/group-dto/full-group.dto';

@ApiTags('Groups')
@Controller('groups')
export class GroupSwaggerController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupUserService: GroupUserService,
    private readonly storage: StorageService,
  ) { }

  @ApiOperation({
    summary: 'Dobij sve grupe korisnika',
    description: 'Vraća listu svih grupa u kojima je korisnik član'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista grupa korisnika',
    type: [BaseGroupDto]
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() userId: number): Promise<BaseGroupDto[]> {
    const groups = await this.groupService.findAll(userId);

    return groups.map((group) => ({
      ...group,
      imagePath: group.profileImageUrl
        ? this.storage.getPublicUrl(group.profileImageUrl)
        : undefined,
    }));
  }

  @ApiOperation({
    summary: 'Dobij detalje grupe',
    description: 'Vraća detaljne informacije o grupi'
  })
  @ApiResponse({
    status: 200,
    description: 'Detalji grupe',
    type: BaseGroupDto
  })
  @ApiResponse({
    status: 403,
    description: 'Nema pristupa ovoj grupi'
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiParam({
    name: 'id',
    description: 'ID grupe',
    example: 1
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @CurrentUser() userId: number,
    @Param('id') id: string,
  ): Promise<FullGroupDto> {


    const group = await this.groupService.findOne(userId, +id);
    if (group.profileImageUrl) {
      group.profileImageUrl = this.storage.getPublicUrl(group.profileImageUrl);
    }
    return group;
  }

  @ApiOperation({
    summary: 'Kreiraj novu grupu',
    description: 'Kreira novu grupu sa opcionom slikom'
  })
  @ApiResponse({
    status: 201,
    description: 'Grupa je uspešno kreirana',
    type: Group
  })
  @ApiResponse({
    status: 400,
    description: 'Neispravni podaci'
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Podaci za kreiranje grupe',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Naziv grupe',
          example: 'Putovanje u Grčku'
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Slika grupe (jpg, jpeg, png, webp)'
        }
      },
      required: ['name']
    }
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: PAGINATION.MAX_LIMIT * 1024 * 1024 },
    }),
  )
  @Post("create")
  async create(
    @CurrentUser() userId: number,
    @Body(ValidationPipe) group: CreateGroupDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PAGINATION.MAX_LIMIT * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    image?: Express.Multer.File,
  ): Promise<{ message: string }> {
    const created = await this.groupService.create(group, userId);

    if (image) {
      const { path } = await this.storage.uploadGroupCover(created.id, image);
      await this.groupService.updateCover(created.id, path);
    }
    return { message: "Group created successfully" };
  }

  @ApiOperation({
    summary: 'Dobij članove grupe',
    description: 'Vraća listu svih članova grupe'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista članova grupe',
    type: [BaseGroupUserDto]
  })
  @ApiResponse({
    status: 403,
    description: 'Nema pristupa ovoj grupi'
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiParam({
    name: 'id',
    description: 'ID grupe',
    example: 1
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getGroupMembers(
    @CurrentUser() userId: number,
    @Param('id') id: string,
  ): Promise<BaseGroupUserDto[]> {
    const validated = await this.groupService.chackMembership(userId, +id);
    if (!validated) {
      throw new ForbiddenException('You do not have access to this resource');
    }
    return this.groupUserService.getGroupMembers(+id)
  }

  @ApiOperation({
    summary: 'Dodaj člana u grupu',
    description: 'Dodaje novog člana u grupu'
  })
  @ApiResponse({
    status: 201,
    description: 'Član je uspešno dodat u grupu',
    type: GroupUser
  })
  @ApiResponse({
    status: 400,
    description: 'Neispravni podaci ili korisnik već postoji u grupi'
  })
  @ApiResponse({
    status: 403,
    description: 'Nema dozvolu za dodavanje članova'
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiParam({
    name: 'group_id',
    description: 'ID grupe',
    example: 1
  })
  @ApiParam({
    name: 'member_id',
    description: 'ID korisnika koji se dodaje',
    example: 5
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':group_id/new-member/:member_id')
  async addMember(
    @CurrentUser() userId: number,
    @Param('group_id') groupId: string,
    @Param('member_id') memberId: string,
  ): Promise<BaseGroupUserDto> {
    if (isNaN(+groupId) || isNaN(+memberId)) {
      throw new BadRequestException('Invalid group or member ID');
    }


    return this.groupService.addMemberToGroup(+groupId, +memberId,userId);
  }

  @ApiOperation({
    summary: 'Ažuriraj grupu',
    description: 'Ažurira informacije o grupi i opciono sliku'
  })
  @ApiResponse({
    status: 200,
    description: 'Grupa je uspešno ažurirana',
    type: BaseGroupDto
  })
  @ApiResponse({
    status: 400,
    description: 'Neispravni podaci'
  })
  @ApiResponse({
    status: 403,
    description: 'Nema dozvolu za ažuriranje grupe'
  })
  @ApiResponse({
    status: 401,
    description: 'Neautorizovan pristup'
  })
  @ApiParam({
    name: 'id',
    description: 'ID grupe',
    example: 1
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Podaci za ažuriranje grupe',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Naziv grupe',
          example: 'Putovanje u Grčku'
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Nova slika grupe (jpg, jpeg, png, webp)'
        }
      }
    }
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: PAGINATION.MAX_LIMIT * 1024 * 1024 },
    }),
  )
  @Patch(':id')
  async update(
    @CurrentUser() userId: number,
    @Param('id') id: string,
    @Body(ValidationPipe) group: UpdateGroupDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PAGINATION.MAX_LIMIT * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    image?: Express.Multer.File,
  ): Promise<BaseGroupDto> {

    const updated = await this.groupService.update(+id, group, userId);

    if (image) {
      const { path } = await this.storage.uploadGroupCover(+id, image);
      await this.groupService.updateCover(+id, path);
    }
    return updated;
  }
  @ApiBearerAuth('JWT-auth')

  @UseGuards(JwtAuthGuard)
  @Delete('kick_member/:memberId/:groupId')
  async kickMember(@Param('memberId') memberId: number, @Param('groupId') groupId: number, @CurrentUser() adminId: number): Promise<{ message: string }> {
    return await this.groupService.kickMemberFromGroup(memberId, groupId, adminId);
  }
  @ApiBearerAuth('JWT-auth')

  @UseGuards(JwtAuthGuard)
  @Delete('delete_group/:id')
  async deleteGroup(@Param('id') id: number, @CurrentUser() adminId: number): Promise<{ message: string }> {
    return await this.groupService.delete(id, adminId);
  }
}