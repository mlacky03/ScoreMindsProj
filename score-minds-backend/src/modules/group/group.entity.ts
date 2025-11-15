

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

@Entity('groups') 
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  groupName: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(()=>User,(user)=>user.ownedGroups)
  @JoinColumn({name:'ownerId'})
  owner:User;


  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({
    name: 'group_members', 
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];
}