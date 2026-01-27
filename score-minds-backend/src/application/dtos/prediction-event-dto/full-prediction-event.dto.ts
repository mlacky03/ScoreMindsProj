import { Player } from "src/domain/models/player.model";
import { PredictionEvent } from "src/domain/models/prediction-event.model";
import { FullPlayerDto } from "../players-dto/full-player.dto";

export class FullPredictionEventDto {
    id:number;
    type:string;
    minute:number;
    playerId:number;
    predictionId:number;
    player:FullPlayerDto|null;
    constructor(event:PredictionEvent,player:FullPlayerDto|null)
    {
        this.id=event.id!;
        this.type=event.type;
        this.minute=event.minute!;
        this.playerId=event.playerId;
        this.predictionId=event.predictionId;
        this.player=player;
    }
}
