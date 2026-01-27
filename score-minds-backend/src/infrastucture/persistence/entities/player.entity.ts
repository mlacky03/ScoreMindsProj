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

  @Column({ type: 'int', nullable: true })
  teamId: number; 

  @Column({ nullable: true })
  position: string;
}