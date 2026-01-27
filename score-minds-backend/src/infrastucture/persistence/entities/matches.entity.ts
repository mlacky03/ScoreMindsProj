import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { PersonalPrediction } from './personal-prediction.entity';
import { GroupPrediction } from './group-prediction.entity';

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

    @Column({ type: 'integer'})
    homeTeamId: number;

    @Column({ type: 'integer'})
    awayTeamId: number;

    @OneToMany(() => PersonalPrediction, (prediction) => prediction.match)
    personalPredictions: PersonalPrediction[];

    @OneToMany(() => GroupPrediction, (prediction) => prediction.match)
    groupPredictions: GroupPrediction[];
}
