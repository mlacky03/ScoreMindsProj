import { Player } from "src/domain/models/player.model";

export class FullPlayerDto {
    id:number;
    externalId:number;
    name:string;
    photo:string;
    teamId:number;
    position:string;
    constructor(p:Player){
        this.id=p.id!;
        this.externalId=p.externalId;
        this.name=p.name;
        this.photo=p.photo;
        this.teamId=p.teamId;
        this.position=p.position;
    }
}