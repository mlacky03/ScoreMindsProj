import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './modules/storage/storage.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth-module/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from './modules/user/user.module';
import { SwaggerModule } from './swaggers/swagger-module';
import { GroupModule } from './modules/group/group.module';
import { GroupUserModule } from './modules/group-user/group-user.module';
import { MatchModule } from './modules/matches/matches.module';
import { PlayerModule } from './modules/players/player.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
       
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        
        synchronize: true, //samo sa production
      
    }),
    
}),
  MulterModule.register({limits: { fileSize: 5 * 1024 * 1024 }}),
  ThrottlerModule.forRoot([{
      ttl: 60000, // Time To Live (TTL): 60 sekundi (60000 milisekundi)
      limit: 10,  // Maksimalno 10 zahteva po korisniku u 60 sekundi
    }]),
    AuthModule,
    UserModule,
    SwaggerModule,
    GroupModule,
    GroupUserModule,
    MatchModule,
    PlayerModule,
    SyncModule

],
controllers: [AppController],
  providers: [AppService, {provide: 'APP_GUARD', useClass: ThrottlerGuard}, StorageService],
})
export class AppModule {}
