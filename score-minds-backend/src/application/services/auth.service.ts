import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dtos/user-dto/create-user.dto';
import { BaseUserDto } from '../dtos/user-dto/base-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }


    async validation(
        email: string,
        password: string
    ): Promise<Partial<BaseUserDto> | null> {
        if (!email || !password) {
            return null;
        }

        const user = await this.userService.findByEmail(email);


        if (!user || !user.passwordHash || !user.id) {
            throw new BadRequestException("Invalid credentials");
        }

        const isPassowrdValid = await bcrypt.compare(password, user.passwordHash);

        if (isPassowrdValid) {
            return {
                id: user.id,          
                email: user.email,    
                username: user.username,
                profileImageUrl: user.profileImageUrl
            };
        }
        throw new BadRequestException('Incorrect password');
    }

    login(
        user: Partial<BaseUserDto>
    ): { access_token: string } {
        console.log(user.id, user.email);
        const payload = { email: user.email, sub: user.id };
        const token = this.jwtService.sign(payload);
        return { access_token: token };

    }

    async register(user: CreateUserDto): Promise<BaseUserDto> {


        return await this.userService.create(user);
    }

}