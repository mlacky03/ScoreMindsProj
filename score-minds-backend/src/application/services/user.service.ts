import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { User } from 'src/domain/models/user.model';
import { FilterUserDto } from '../dtos/user-dto/fileter-user.dto';
import { BaseUserDto } from '../dtos/user-dto/base-user.dto';
import { COMMON_SELECT_FIELDS, getSelectFields, ORDER_DIRECTION, PAGINATION } from 'src/common/constants/pagination.constants';
import { FullUserDto } from '../dtos/user-dto/full-user.dto';
import { UserNotFoundException } from 'src/common/exceptions/all.exceptions';
import { CreateUserDto } from '../dtos/user-dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dtos/user-dto/update-user.dto';
import { UserRepository } from 'src/infrastucture/persistence/repositories/user.repository';
import { ClientProxy } from '@nestjs/microservices';
import { PersonalPredictionRepository } from 'src/infrastucture/persistence/repositories/personal-prediction.repository';
import { GroupRepository } from 'src/infrastucture/persistence/repositories/group.repository';
import { GroupUserRepository } from 'src/infrastucture/persistence/repositories/group-user.repository';

@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository)
        private readonly repo: UserRepository,
        @Inject(PersonalPredictionRepository)
        private readonly predictionRepo: PersonalPredictionRepository,
        @Inject(GroupRepository)
        private readonly groupRepo: GroupRepository,
        @Inject(GroupUserRepository)
        private readonly groupUserRepo: GroupUserRepository,
        @Inject('RABBITMQ_SERVICE')
        private readonly rabbitClient: ClientProxy,) {

    };

    async findAll(filter?: FilterUserDto): Promise<BaseUserDto[]> {
        const users = await this.repo.findAllWithFilters(filter);

        return users.map((u) => new BaseUserDto(u));
    }

    async findOne(id: number): Promise<FullUserDto> {
        const [user, predictions, ownedGroups, groups] = await Promise.all([
            this.repo.findById(id),
            this.predictionRepo.findByUserId(id),
            this.groupUserRepo.findByUserId(id),
            this.groupRepo.findByOwner(id)

        ]);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        return new FullUserDto(user, predictions, groups, ownedGroups);
    }

    async finOneForCheck(id: number): Promise<BaseUserDto> {
        
        const u= await this.repo.findById(id);
        if (!u) {
            throw new UserNotFoundException(id);
        }
        return  new BaseUserDto(u);
    }

    async create(user: CreateUserDto): Promise<BaseUserDto> {
        if (await this.findByEmail(user.email)) {
            throw new BadRequestException('Email already exists');
        }
        if (await this.repo.findByUsername(user.username)) {
            throw new BadRequestException('Username already exists');
        }

        const passwordhased: string = await bcrypt.hash(user.password, 10);
        const newUser = new User(
            null,
            user.username,
            user.email,
            passwordhased,
            new Date(),
            user.profileImageUrl
        );
        const createdUser = await this.repo.save(newUser);
        return new BaseUserDto(createdUser);
    }

    async update(id: number, user: UpdateUserDto): Promise<BaseUserDto> {
        const oldUser = await this.repo.findById(id);

        if (!oldUser) {
            throw new UserNotFoundException(id);
        }
        if (user.email) {
            const userWithEmail = await this.repo.findByEmail(user.email);
            if (userWithEmail && userWithEmail.id !== id) {
                throw new BadRequestException('Email already exists');
            }
        }
        if (user.username) {
            const userWithUsername = await this.repo.findByUsername(user.username);
            if (userWithUsername && userWithUsername.id !== id) {
                throw new BadRequestException('Username already exists');
            }
        }


        oldUser.updateUser(user.username, user.email, user.profileImageUrl);

        const updatedUser = await this.repo.save(oldUser);

        return new BaseUserDto(updatedUser);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repo.findByEmail(email);
    }

    async updateAvatar(id: number, url: string): Promise<BaseUserDto> {
        const user = await this.repo.findById(id);
        if (!user) {
            throw new UserNotFoundException(id);
        }

        user.updateProfileImage(url);
        const updated = await this.repo.save(user);
        return new BaseUserDto(updated);
    }

}


