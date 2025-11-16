
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

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  groupName: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.ownedGroups)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl: string;

  @OneToMany(() => GroupUser, (user) => user.group)
  members: User[];
}