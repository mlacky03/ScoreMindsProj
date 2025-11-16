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

@Entity('predictions')
@Index(['user', 'matchId'], { unique: true })
export class Prediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  matchId: string; 

  @Column({ type: 'integer' })
  predictedHomeScore: number; 

  @Column({ type: 'integer' })
  predictedAwayScore: number;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number;

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn() 
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.predictions)
  user: User;
  

  @OneToMany(
    () => PredictionEvent,
    (predictionEvent) => predictionEvent.prediction,
    { cascade: true }, 
  )
  predictedEvents: PredictionEvent[];
}