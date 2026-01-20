import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    CreateDateColumn,
    JoinColumn
} from 'typeorm';
import { Prediction } from '../prediction/prediction.entity';
import { User } from '../user/user.entity';

@Entity('prediction_audit')
export class PredictionAudit {
    @PrimaryGeneratedColumn()
    id: number;
   
    @ManyToOne(() => Prediction, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'prediction_id' })
    prediction: Prediction;

    @Column({ name: 'prediction_id' })
    predictionId: number;


    @ManyToOne(() => User)
    @JoinColumn({ name: 'changed_by' })
    changedBy: User;

    @Column({ name: 'changed_by' })
    changedById: number;


    @Column({ type: 'jsonb' })
    oldValue: any; 

    
    @Column({ type: 'jsonb' })
    newValue: any; 

    
    @CreateDateColumn({ name: 'changed_at' })
    changedAt: Date;
}