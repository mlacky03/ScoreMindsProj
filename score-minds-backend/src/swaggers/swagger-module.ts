import { Module } from '@nestjs/common';
import { UserSwaggerController } from './swagger-controllers/user-swagger.controller';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from '../modules/auth-module/auth.module';
import { StorageService } from '../modules/storage/storage.service';
import { GroupSwaggerController } from './swagger-controllers/group-swagger.controller';
import { GroupModule } from 'src/modules/group/group.module';
import { GroupUserModule } from 'src/modules/group-user/group-user.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    GroupModule,
    GroupUserModule
  ],
  controllers: [
    UserSwaggerController,
    GroupSwaggerController
  ],
  providers: [StorageService],
})
export class SwaggerModule {}