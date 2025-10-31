import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {User } from './modules/user/user.entity';
import {Prediction} from './modules/prediction/prediction.entity';
import {PredictionEvent} from './modules/prediction-event/predictionEvent.entity';
import {Group} from './modules/group/group.entity';

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

        entities: [User, Group, Prediction, PredictionEvent],
        
        synchronize: true, //samo sa production
      
    }),
})
],
controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
