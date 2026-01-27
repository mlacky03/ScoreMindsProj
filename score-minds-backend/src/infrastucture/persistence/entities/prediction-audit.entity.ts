import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity'; 

export enum CreateOption {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}
@Entity('prediction_audits')
export class PredictionAudit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    predictionId: number;
    @Column({ name: 'user_id' }) 
    userId: number;
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User; 

    @Column({ nullable: true })
    action: CreateOption;     

    @Column({ type: 'jsonb', nullable: true }) 
    changes: any; 

    @CreateDateColumn()
    createdAt: Date;
}