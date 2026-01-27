import { UpdatePredictionEventDto } from "src/application/dtos/prediction-event-dto/update-prediction-event.dto";
import { EventType } from "../enums/CreateOption";
import { Player } from "./player.model";

export class PredictionEvent {
    constructor(
        private _id: number | null,
        private _type: EventType,
        private _playerId: number,
        private _predictionId: number,
        private _minute: number | null = null
    ) {
        this.validateMinute(_minute);
    }



    public updateMinute(newMinute: number): void {
        this.validateMinute(newMinute);
        this._minute = newMinute;
    }

    public changeType(newType: EventType): void {
        this._type = newType;
    }

    private validateMinute(minute: number | null): void {
        if (minute !== null && (minute < 0 || minute > 130)) {
            throw new Error("Minut mora biti između 0 i 130.");
        }
    }

    public updatePlayerId(newPlayerId: number): void {
        this._playerId = newPlayerId;
    }

    public updatePredictionEvent(newPrediction: UpdatePredictionEventDto): void {
        this._type = newPrediction.type||this._type;
        this._minute = newPrediction.minute||null;
    }

    get id() { return this._id; }
    get type() { return this._type; }
    get playerId() { return this._playerId; }
    get predictionId() { return this._predictionId; }
    get minute() { return this._minute; }
}
