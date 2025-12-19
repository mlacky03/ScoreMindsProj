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
import { PredictionEvent } from '../prediction-event/predictionEvent.entity'; 
import { Match } from '../matches/matches.entity';

@Entity('predictions')
@Index(['user', 'matchId'], { unique: true })
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (match) => match.predictions)
  match: Match; 

  @Column({ type: 'integer' })
  predictedHomeScore: number; 

  @Column({ type: 'integer' })
  predictedAwayScore: number;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number;

  @CreateDateColumn() 
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUserChange: Date

  @ManyToOne(() => User, (user) => user.predictions)
  user: User;
  

  @OneToMany(
    () => PredictionEvent,
    (predictionEvent) => predictionEvent.prediction,
    { cascade: true }, 
  )
  predictedEvents: PredictionEvent[];
}