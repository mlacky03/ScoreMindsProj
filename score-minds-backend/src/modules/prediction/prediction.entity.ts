// src/prediction/entities/prediction.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { PredictionEvent } from '../prediction-event/prediction-event.entity'; 
import { Match } from '../matches/matches.entity';

export enum WinnerOption {
  HOME = 'HOME',
  AWAY = 'AWAY',
  DRAW = 'DRAW'
}
@Entity('predictions')
@Index(['user', 'match'], { unique: true })
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer',nullable: true })
  predictedHomeScore: number; 

  @Column({ type: 'integer',nullable: true })
  predictedAwayScore: number;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number;

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: WinnerOption, nullable: true })
  winner: WinnerOption;

  @ManyToOne(() => User, (user) => user.predictions,{ onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({type:'integer'})
  matchId:number;

  @ManyToOne(() => Match, (match) => match.predictions,{ onDelete: 'CASCADE' })
  match: Match; 
  

  @OneToMany(
    () => PredictionEvent,
    (predictionEvent) => predictionEvent.prediction,
    { cascade: true }, 
  )
  predictedEvents: PredictionEvent[];
}