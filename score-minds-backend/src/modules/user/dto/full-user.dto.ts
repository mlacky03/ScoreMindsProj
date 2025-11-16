import { User } from "../user.entity";
import { Prediction } from "../../prediction/prediction.entity";
import { Group } from "../../group/group.entity";
import { GroupUser } from "src/modules/group-user/group-user.entity";

export class FullUserDto {
    id: number;
    username: string;
    email: string;
    profileImageUrl: string;
    createdAt: Date;
    predictions: number[];
    groups: number[];
    ownedGroups: number[];

    constructor(user: User) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.profileImageUrl = user.profileImageUrl;
        this.createdAt = user.createdAt;
        this.predictions = user.predictions?.map(p=>p.id);
        this.groups = user.groups?.map(gm=>gm.groupId);
        this.ownedGroups = user.ownedGroups?.map(g=>g.id);
    }
}
