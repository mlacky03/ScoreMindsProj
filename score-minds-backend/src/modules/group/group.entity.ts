

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity'; 

@Entity('groups') 
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  groupName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false   }) 
  owner: User;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({
    name: 'group_members', 
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];
}