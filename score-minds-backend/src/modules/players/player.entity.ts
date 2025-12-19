import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { GroupUser } from '../group-user/group-user.entity';
import { Index } from 'typeorm';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  externalId: number; 

  @Column()
  name: string; 

  @Column({ nullable: true })
  photo: string; 

  @Column()
  teamId: number; 

  @Column({ nullable: true })
  position: string;
}