import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterUserDto } from './dto/fileter-user.dto';
import { BaseUserDto } from './dto/base-user.dto';
import { COMMON_SELECT_FIELDS, getSelectFields, ORDER_DIRECTION, PAGINATION } from 'src/common/constants/pagination.constants';
import { FullUserDto } from './dto/full-user.dto';
import { UserNotFoundException } from 'src/common/exceptions/all.exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService extends BaseService<User> {
    constructor(
        @InjectRepository(User) 
        private readonly repo:Repository<User>){
            super(repo);
        };

        async findAll(filter:FilterUserDto) :Promise<BaseUserDto[]>
        {
            const qb=this.CreateBaseQueryBuilder("user")
                        .select(getSelectFields("user",COMMON_SELECT_FIELDS.USER));

            this.applySearch(qb,
                {
                    search:['username','email'],
                    searchTherm:filter?.query
                }
            );

            this.applyPaggination(qb,
                {
                    limit:PAGINATION.USER_SEARCH_LIMIT,
                    sort:'username',
                    order:"DESC"
                    
                }
            )

            const res=await qb.getMany();
            
            return res.map((r)=>new BaseUserDto(r));
        }

        async findOne(id:number) :Promise<FullUserDto>
        {
            const user:User | null=await  this.repo
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.ownedGropus','ownedGropus')
                .leftJoinAndSelect('user.groups','groups')
                .where('user.id= :id',{id})
                .getOne();

                if(!user)
                {
                    throw new UserNotFoundException(id);
                }

            return user;
        }

        async create(user:CreateUserDto) :Promise<FullUserDto>
        {
            const passwordhased: string=await bcrypt.hash(user.passwordHash,10);
            const newUser=await this.repo.create({...user,passwordHash: passwordhased});
            const savedUser= await this.repo.save(newUser);

            return(savedUser);
        }

        async update(id:number,user:UpdateUserDto) :Promise<FullUserDto>
        {
            const oldUser=await this.repo.findOneBy({id});
            
            if(!oldUser)
            {
                throw new UserNotFoundException(id);
            }

            const updateUser=await this.repo.merge(oldUser,user);
            const savedUser= await this.repo.save(updateUser);

            return(savedUser);
        }

        async findByEmail(email:string) : Promise<User|null>
        {
             return await this.repo.findOneBy({ email });
        }

        async updateAvatar(id:number,url:string) : Promise<void>
        {
            const user= await this.repo.findOneBy({id});
            if(!user)
            {
                throw new UserNotFoundException(id);
            }
            await this.repo.update({id},{profileImageUrl: url});
        }

}


