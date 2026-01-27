import { GroupUser } from "src/domain/models/group-user.model";
import { Group } from "src/domain/models/group.model";
import { PersonalPrediction } from "src/domain/models/personal-prediction.model";
import { User } from "src/domain/models/user.model";

export class FullUserDto {
    id: number;
    username: string;
    email: string;
    profileImageUrl: string;
    createdAt: Date;
    predictions: (number|null)[];
    groups: (number|null)[];
    ownedGroups: (number|null)[];

    constructor(user: User,predictions: PersonalPrediction[], groups: Group[], ownedGroups: GroupUser[]) {
        this.id = user.id!;
        this.username = user.username;
        this.email = user.email;
        this.profileImageUrl = user.profileImageUrl;
        this.createdAt = user.createdAt;
        this.predictions = predictions?.map(p=>p.id) ;
        this.groups = groups?.map(g=>g.id) ;
        this.ownedGroups = ownedGroups?.map(g=>g.groupId);
    }
}
