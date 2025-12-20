import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
    ValidationPipe,
    BadRequestException,
    Post,
    UseInterceptors,
    UploadedFile,
    Query,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FullUserDto } from './dto/full-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseUserDto } from './dto/base-user.dto';
import { FilterUserDto } from './dto/fileter-user.dto';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { QueryResult } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private storageService: StorageService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll
        (
            @CurrentUser() id: number,
            @Query() query: string,
        ): Promise<BaseUserDto[]> {
        const filter: FilterUserDto = { query };

        const users = await this.userService.findAll(filter);

        return users.map(user => ({
            ...user,
            profileImageUrl: user.profileImageUrl ? this.storageService.getPublicUrl(user.profileImageUrl) : undefined,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Get("profil")
    async findOne(
        @CurrentUser() userId: number
    ): Promise<FullUserDto> {
        const user = await this.userService.findOne(userId);


        return { ...user, profileImageUrl: user.profileImageUrl ? this.storageService.getPublicUrl(user.profileImageUrl) : undefined, } as FullUserDto;

    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    @Patch()
    async update(
        @CurrentUser() userId: number,
        @Body(ValidationPipe) user: UpdateUserDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [

                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),

                ],
            })
        )
        file?:Express.Multer.File
    ):Promise<FullUserDto>
    {
        if(file)
        {
            const {path}= await this.storageService.uploadUserAvatar(userId,file);

            await this.userService.updateAvatar(userId,path);
        }
        
        return this.userService.update(userId,user);
    }


    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    @Post()
    async updateAvatar(
        @CurrentUser() userId:number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if(!file)
        {
            throw new BadRequestException("No file provided");
        }

        const {path,url}= await this.storageService.uploadUserAvatar(userId,file);
        await this.userService.updateAvatar(userId,path);

        
        return {image_path:path,image_url:url};
        
    }


}