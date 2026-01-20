

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Prediction } from '../prediction/prediction.entity';
import { Player } from '../players/player.entity';

export enum EventType {
  GOAL = 'GOAL',
  ASSIST = 'ASSIST',
  YELLOW_CARD = 'YELLOW_CARD',
  RED_CARD = 'RED_CARD'
}


@Entity('predicted_events') 
export class PredictionEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EventType, default: EventType.GOAL })
  type: EventType;

  @Column({ type: 'integer',nullable:true }) 
  minute: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player

  @Column({ name: 'prediction_id' })
  predictionId: number;
  
  @ManyToOne(() => Prediction, (prediction) => prediction.predictedEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prediction_id' })
  prediction: Prediction;
}