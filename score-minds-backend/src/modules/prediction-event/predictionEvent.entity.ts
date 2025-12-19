

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Prediction } from '../prediction/prediction.entity';
import { Player } from '../players/player.entity';

@Entity('predicted_events') 
export class PredictionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['GOAL', 'ASSIST', 'YELLOW_CARD','RED_CARD'], default: 'GOAL' })
  type: string;

  @Column({ type: 'integer' }) 
  minute: number;

  @ManyToOne(() => Player)
  scorer: Player

  @ManyToOne(() => Player, { nullable: true }) 
  assister: Player;

  @ManyToOne(() => Prediction, (prediction) => prediction.predictedEvents)
  prediction: Prediction;
}