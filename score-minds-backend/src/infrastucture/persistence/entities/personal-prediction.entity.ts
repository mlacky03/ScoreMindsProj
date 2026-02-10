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
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from './user.entity';
import { PredictionEvent } from './prediction-event.entity';
import { Match } from './matches.entity';
import { BasePrediction } from './base-prediction.abstract';


@Entity('predictions')
@Index(['userId', 'matchId'],{ unique: true })
export class PersonalPrediction extends BasePrediction {

  @Column({ name: 'user_id'})
  userId: number;

  @ManyToOne(() => User, (user) => user.personalPredictions, { onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PredictionEvent, e => e.personalPrediction, { cascade: true })
  predictedEvents: PredictionEvent[];
}