import { UserBaseDto } from "../../users/data/user-base.dto";
import { UserDto } from "../../users/data/user.dto";
import { GroupUserBaseDto } from "./group-user-base.dto";

export interface GroupFullDto
{
    id:number;
    name:string;
    profileImageUrl?:string;
    points:number;
    owner:UserBaseDto;
    members:GroupUserBaseDto[];
}