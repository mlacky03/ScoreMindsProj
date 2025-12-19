
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth-module/auth.module';
import { StorageService } from '../storage/storage.service';
import { UserValidationService } from '../../common/services/user-validation.service';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => AuthModule),
    forwardRef(() => GroupModule)
  ],
  providers: [UserService, StorageService, UserValidationService],
  controllers: [UserController], 
  exports: [UserService],
})
export class UserModule {}