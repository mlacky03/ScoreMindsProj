// src/auth/user/entities/user.entity.ts

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

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index() 
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index() 
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true }) 
  profileImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Prediction, (prediction) => prediction.user)
  predictions: Prediction[];

  @ManyToMany(() => Group, (group) => group.members)
  groups: Group[];

  @OneToMany(() => Group, (group) => group.owner)
  ownedGroups: Group[];
}