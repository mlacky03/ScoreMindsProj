import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/presentation/controllers/auth.controller';
import { AuthService } from 'src/application/services/auth.service';
import { User } from 'src/infrastucture/persistence/entities/user.entity';
import { UserModule } from './user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './auth-module/jwt.strategy';
import { StorageService } from 'src/application/services/storage.service';

@Module({
  imports: [
    PassportModule,
    //?
    JwtModule.register({
      secret: 'your_jwt_secret', //! Use env later
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, StorageService], 
    exports: [AuthService, JwtModule,PassportModule, JwtStrategy],
})
export class AuthModule {}