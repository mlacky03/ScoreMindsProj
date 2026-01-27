import { User } from "src/domain/models/user.model";
import {FullUserDto} from "./full-user.dto";

export class BaseUserDto {
    id: number;
    username: string;
    email: string;
    profileImageUrl?: string;
    
    constructor(user: User | Partial<BaseUserDto>) {
        this.id = user.id!;
        this.username = user.username!;
        this.email = user.email!;
        this.profileImageUrl = user.profileImageUrl;
    }
}