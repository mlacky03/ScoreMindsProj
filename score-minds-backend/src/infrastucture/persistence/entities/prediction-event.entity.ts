

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { PersonalPrediction } from './personal-prediction.entity';
import { Player } from './player.entity';
import { GroupPrediction } from './group-prediction.entity';

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
  minute: number|null;

  @Column({ name: 'player_id' })
  playerId: number;

  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: Player

  @Column({ name: 'prediction_id' })
  predictionId: number;
  
  @ManyToOne(() => PersonalPrediction, p => p.predictedEvents, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'personal_prediction_id' })
  personalPrediction: PersonalPrediction;


  @ManyToOne(() => GroupPrediction, p => p.predictedEvents, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'group_prediction_id' })
  groupPrediction: GroupPrediction;
}