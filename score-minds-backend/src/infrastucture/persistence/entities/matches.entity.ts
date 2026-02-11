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
import { EventRecord } from 'src/application/interfaces/event-record';

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

    @Column( {type:'jsonb', default: [], nullable: true })
    events: EventRecord[];

    @Column({ type: 'integer'})
    homeTeamId: number;

    @Column({ type: 'integer'})
    awayTeamId: number;

    @Column({ default: false })
    isComputed: boolean;

    @OneToMany(() => PersonalPrediction, (prediction) => prediction.match)
    personalPredictions: PersonalPrediction[];

    @OneToMany(() => GroupPrediction, (prediction) => prediction.match)
    groupPredictions: GroupPrediction[];
}
