export interface UserDto{
    id: number;
    username: string;
    email: string;
    profileImageUrl?: string;
    createdAt:Date;
    groups: number[];
    ownedGroups: number[];
    predictions: number[];
}