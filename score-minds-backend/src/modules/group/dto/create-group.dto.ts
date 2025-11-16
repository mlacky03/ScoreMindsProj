import { IsString } from "class-validator";

export class CreateGroupDto{

    @IsString()
    groupName:string;
    profileImageUrl?:string;
    
}