
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
@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({ name: 'owner_id' })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.ownedGroups)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'varchar', nullable: true })
  profileImageUrl: string;

  @OneToMany(() => GroupUser, (user) => user.group)
  members: GroupUser[];
}