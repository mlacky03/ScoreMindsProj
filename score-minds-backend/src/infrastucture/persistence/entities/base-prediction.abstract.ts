// base-prediction.abstract.ts
import { Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Match } from './matches.entity';

export enum WinnerOption {
  HOME = 'HOME',
  AWAY = 'AWAY',
  DRAW = 'DRAW'
}
export abstract class BasePrediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  matchId: number;

  @ManyToOne(() => Match, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column({ type: 'integer', nullable: true })
  predictedHomeScore: number | null;

  @Column({ type: 'integer', nullable: true })
  predictedAwayScore: number | null;

  @Column({ type: 'integer', default: 0 })
  pointsWon: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'integer', default: 0 })
  totalPoints: number;

  @Column({ type: 'enum', enum: WinnerOption, nullable: true })
    winner: WinnerOption;
}