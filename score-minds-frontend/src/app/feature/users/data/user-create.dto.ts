import { IsString, IsStrongPassword, IsEmail } from "class-validator";
import { UserDto } from "./user.dto";
export class UserCreateDto
{
    @IsString()
    username: string;
    @IsEmail()
    email: string;
     @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    password: string;


    constructor(model:UserDto,password:string )
    {
        this.username = model.username;
        this.email = model.email;
        this.password = password;
    }

}