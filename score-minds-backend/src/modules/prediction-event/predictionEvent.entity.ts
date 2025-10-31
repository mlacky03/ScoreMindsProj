

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Prediction } from '../prediction/prediction.entity';

@Entity('predicted_events') 
export class PredictionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: 'GOAL' })
  type: string;

  @Column({ type: 'integer' }) 
  minute: number;

  @Column({ type: 'varchar' }) 
  scorerPlayerId: string;

  @Column({ type: 'varchar', nullable: true }) 
  assisterPlayerId: string;

  @ManyToOne(() => Prediction, (prediction) => prediction.predictedEvents)
  prediction: Prediction;
}