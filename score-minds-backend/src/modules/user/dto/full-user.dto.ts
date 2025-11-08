import { User } from "../user.entity";
import { Prediction } from "../../prediction/prediction.entity";
import { Group } from "../../group/group.entity";

export class FullUserDto {
    id: number;
    username: string;
    email: string;
    profileImageUrl: string;
    createdAt: Date;
    predictions: Prediction[];
    groups: Group[];
    ownedGroups: Group[];

    constructor(user: User) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.profileImageUrl = user.profileImageUrl;
        this.createdAt = user.createdAt;
        this.predictions = user.predictions;
        this.groups = user.groups;
        this.ownedGroups = user.ownedGroups;
    }
}
