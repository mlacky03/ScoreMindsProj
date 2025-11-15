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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { UserService } from 'src/modules/user/user.service';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { FullUserDto } from 'src/modules/user/dto/full-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseUserSwaggerDto } from '../swagger-dto/base-user-swagger.dto';
import { FilterUserDto } from 'src/modules/user/dto/fileter-user.dto';
import { StorageService } from '../../modules/storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from 'src/modules/user/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserSwaggerController{
  constructor(
    private readonly userSerivce:UserService,
    private storageService:StorageService,
  )
  {}

    @ApiOperation({ 
    summary: 'Pretraži korisnike',
    description: 'Vraća listu korisnika na osnovu pretrage po username-u ili email-u'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista pronađenih korisnika',
    type: [BaseUserSwaggerDto]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Neautorizovan pristup' 
  })
  @ApiQuery({ 
    name: 'query', 
    required: false, 
    description: 'Tekst za pretragu korisnika',
    example: 'Mlacky'
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @CurrentUser() userId:string,
    @Query('query') query:string) :Promise<BaseUserSwaggerDto[]>
  {
    const filters:FilterUserDto= {query};

    const users= await this.userSerivce.findAll(filters);

    return users.map(user=>({...user,profileImageUrl: user.profileImageUrl ? this.storageService.getPublicUrl(user.profileImageUrl):undefined,})) ;
  }
  
   @ApiOperation({ 
    summary: 'Dobij profil korisnika',
    description: 'Vraća detaljne informacije o trenutno ulogovanom korisniku'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detaljne informacije o korisniku',
    type: FullUserDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Neautorizovan pristup' 
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async findOne(
    @CurrentUser() userId:number
  ) :Promise<FullUserDto>
  {
    const user= await this.userSerivce.findOne(userId);

    return {...user,profileImageUrl:user.profileImageUrl? this.storageService.getPublicUrl(user.profileImageUrl):undefined,} as FullUserDto
  }


   @ApiOperation({ 
    summary: 'Ažuriraj profil korisnika',
    description: 'Ažurira informacije o korisniku i opciono sliku profila'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Korisnik je uspešno ažuriran' 
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
    description: 'Podaci za ažuriranje korisnika',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Nadimak na sajtu',
          example: 'Mlacky'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Email adresa',
          example: 'marko.petrovic@example.com'
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Slika profila (jpg, jpeg, png, webp)'
        }
      }
    }
  })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch()
  async update(
    @CurrentUser() userId:number,
    @Body(ValidationPipe) user:UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired:false,
        validators:[
          new MaxFileSizeValidator({maxSize:5*1024*1024}),
          new FileTypeValidator({fileType:/(jpg|jpeg|webp|png)$/
          }) ,
        ],
      })
    ) file?: Express.Multer.File
  )
  {
    if(file)
    {
      const {path}= await this.storageService.uploadUserAvatar(userId,file);
      await this.userSerivce.updateAvatar(userId,path);
    }

     return await this.userSerivce.update(userId,user);
  }

    @ApiOperation({ 
    summary: 'Postavi sliku profila',
    description: 'Upload-uje novu sliku profila za korisnika'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Slika profila je uspešno postavljena',
    schema: {
      type: 'object',
      properties: {
        image_path: {
          type: 'string',
          description: 'Putanja do slike',
          example: 'avatars/user123.jpg'
        },
        image_url: {
          type: 'string',
          description: 'URL slike',
          example: 'https://example.com/avatars/user123.jpg'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Nije priložena slika' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Neautorizovan pristup' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Slika profila',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Slika profila (jpg, jpeg, png, webp)'
        }
      },
      required: ['file']
    }
  })
  async updateAvatar(
    @CurrentUser() userId:number,
    @UploadedFile() file:Express.Multer.File,
  ){
    if(!file)
    {
      throw new BadRequestException("No file provided");
    }

    const {path,url}= await this.storageService.uploadUserAvatar(userId,file);

    await this.userSerivce.updateAvatar(userId,path);

    return {image_path:path,image_url:url};

  }
}