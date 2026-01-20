import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Prediction } from '../prediction/prediction.entity';
import { Group } from '../group/group.entity';
import { GroupUser } from '../group-user/group-user.entity';

@Entity()
export class Match{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    externalId:number;

    @Column()
    awayTeamName:string;

    @Column()
    homeTeamName:string;

    @Column({ nullable: true })
    homeTeamLogo: string; 

    @Column({ nullable: true })
    awayTeamLogo: string;

    @Index()
    @Column()
    startTime: Date; 

    @Column({ default: 'NS' }) 
    status: string;

    @Column({ type: 'integer', nullable: true })
    finalScoreHome: number|null;

    @Column({ type: 'integer', nullable: true })
    finalScoreAway: number|null;

    @Column("integer", { array: true, nullable: true })
    actualScorersIds: number[];

    @Column("integer", { array: true, nullable: true })
    actualAssistantsIds: number[];

    @OneToMany(() => Prediction, (prediction) => prediction.match)
    predictions: Prediction[];
}