import { UserBaseDto } from "../../users/data/user-base.dto";

export interface GroupUserBaseDto{
    id:number;
    userId:number;
    groupId:number;
    user:UserBaseDto;
}