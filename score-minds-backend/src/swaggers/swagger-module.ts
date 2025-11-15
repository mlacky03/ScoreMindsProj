import { Module } from '@nestjs/common';
import { UserSwaggerController } from './swagger-controllers/user-swagger.controller';
import { UserModule } from 'src/modules/user/user.module';
//import { GroupsModule } from '../modules/groups/groups.module';
import { AuthModule } from '../modules/auth-module/auth.module';
import { StorageService } from '../modules/storage/storage.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
  ],
  controllers: [
    UserSwaggerController,
  ],
  providers: [StorageService],
})
export class SwaggerModule {}