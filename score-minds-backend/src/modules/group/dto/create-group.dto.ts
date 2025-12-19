import { IsString } from "class-validator";
import { Expose } from "class-transformer";

export class CreateGroupDto{

    @IsString()
    name:string;
    profileImageUrl?:string;
    
}