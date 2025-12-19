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

    @Column()
    startTime: Date; 

    @Column({ default: 'NS' }) 
    status: string;

    @Column({ nullable: true })
    finalScoreHome: number;

    @Column({ nullable: true })
    finalScoreAway: number;

    @Column('simple-array', { nullable: true })
    actualScorersIds: string[]; 

    @Column('simple-array', { nullable: true })
    actualAssistantsIds: string[];

    @OneToMany(() => Prediction, (prediction) => prediction.match)
    predictions: Prediction[];
}