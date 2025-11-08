import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { FullUserDto } from '../user/dto/full-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }


    async validation(
        email: string,
        password: string
    ): Promise<Partial<FullUserDto> | null> {
        if (!email || !password) {
            return null;
        }

        const user = await this.userService.findByEmail(email);


        if (!user || !user.passwordHash) {
            throw new BadRequestException("Invalid credentials");
        }

        const isPassowrdValid = await bcrypt.compare(password, user.passwordHash);

        if (isPassowrdValid) {
            const { ...result } = user;
            return new FullUserDto(result);
        }
        throw new BadRequestException('Incorrect password');
    }

    login(
        user: Partial<FullUserDto>
    ): { access_token: string } {

        const payload = { email: user.email, sub: user.id };
        const token = this.jwtService.sign(payload);
        return { access_token: token };

    }

    async register(user:CreateUserDto):Promise<FullUserDto>
    {
        return await this.userService.create(user);
    }

}