import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageService } from '../storage/storage.service';
import { LoginSwaggerDto } from 'src/swaggers/swagger-dto/login-swagger.dto';
import { CreateUserSwaggerDto } from 'src/swaggers/swagger-dto/create-user-swagger.dto';
import { GuardsConsumer } from '@nestjs/core/guards';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private authService: AuthService,
  ) {

  }

  @ApiOperation({
    summary: 'Prijavljivanje korisnika',
    description: 'Prijavljuje korisnika u sistem i vraća JWT token'
  })
  @ApiResponse({
    status: 200,
    description: 'Uspešno prijavljivsdsaanje',
    type: LoginSwaggerDto
  })
  @ApiResponse({
    status: 401,
    description: 'Neispravni kredencijali'
  })
  @ApiBody({
    description: 'Podaci za prijavljivanje',
    type: LoginSwaggerDto
  })
  @Post('login')
  async login(
    @Body() login: LoginDto,
  ) {
    const user = await this.authService.validation(
      login.email,
      login.password,
    );
    if (!user) {
      throw new UnauthorizedException("Invalid cardinals");

    }

    return this.authService.login(user);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Podaci za registraciju korisnika',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Ime korisnika u aplikaciji',
          example: 'Mlacky'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Email adresa',
          example: 'nikola@gmail.com'
        },
        password: {
          type: 'string',
          description: 'Lozinka',
          example: 'Admin123!'
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Slika profila (jpg, jpeg, png, webp)'
        }
      },
      required: ['username', 'email', 'password']
    }
  })
  @Post('register')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async register(
    @Body(ValidationPipe) user: CreateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators:
          [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|webp|png)$/ }),
          ],
      })
    ) image?: Express.Multer.File
  ) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const created = await this.authService.register(user);


    if (image) {
      const { path } = await this.storageService.uploadUserAvatar(created.id, image);
      await this.userService.updateAvatar(created.id, path);
    }


    return created;
  }

}