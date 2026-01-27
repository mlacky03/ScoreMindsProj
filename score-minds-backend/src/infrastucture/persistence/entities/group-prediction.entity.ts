// group-prediction.entity.ts
import { Entity, ManyToOne, JoinColumn, Column, Index, OneToMany } from 'typeorm';
import { BasePrediction } from './base-prediction.abstract';
import { Group } from './group.entity';
import { User } from './user.entity';
import { PredictionEvent } from './prediction-event.entity';

export enum PredictionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PROCESSED = 'PROCESSED'
}

@Entity('group_predictions')
@Index(['groupId', 'matchId'], { unique: true }) 
export class GroupPrediction extends BasePrediction {
  
  @Column({ name: 'group_id' })
  groupId: number;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;


  @Column({
    type: 'enum',
    enum: PredictionStatus,
    default: PredictionStatus.DRAFT
  })
  status: PredictionStatus;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'last_updated_by_id' })
  lastUpdatedById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'last_updated_by_id' })
  lastUpdatedBy: User;

  @OneToMany(() => PredictionEvent, e => e.groupPrediction, { cascade: true })
  predictedEvents: PredictionEvent[];
}