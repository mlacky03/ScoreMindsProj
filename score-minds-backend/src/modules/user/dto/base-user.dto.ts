import {User} from "../user.entity";
import {FullUserDto} from "./full-user.dto";

export class BaseUserDto {
    id: number;
    username: string;
    email: string;
    profileImageUrl?: string;
    
    constructor(user: User | FullUserDto) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.profileImageUrl = user.profileImageUrl;
    }
}