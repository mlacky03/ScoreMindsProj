import {Player} from "../player.entity";

export class FullPlayerDto {
    id:number;
    externalId:number;
    name:string;
    photo:string;
    teamId:number;
    position:string;
    constructor(p:Player){
        this.id=p.id;
        this.externalId=p.externalId;
        this.name=p.name;
        this.photo=p.photo;
        this.teamId=p.teamId;
        this.position=p.position;
    }
}