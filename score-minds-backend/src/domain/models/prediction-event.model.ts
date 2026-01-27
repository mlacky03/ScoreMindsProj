import { UpdatePredictionEventDto } from "src/application/dtos/prediction-event-dto/update-prediction-event.dto";
import { EventType } from "../enums/CreateOption";
import { Player } from "./player.model";

export class PredictionEvent {
    constructor(
        private _id: number | null,
        private _type: EventType,
        private _playerId: number,
        private _personalPredictionId: number | null,
        private _groupPredictionId: number | null,
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

    public updatePredictionEvent(type:EventType,minute:number): void {
        this._type = type||this._type;
        this._minute = minute||null;
    }

    public updatePredictionId(newPredictionId: number): void {
        this._personalPredictionId = newPredictionId;
    }

    public updateGroupPredictionId(newGroupPredictionId: number): void {
        this._groupPredictionId = newGroupPredictionId;
    }

    get id() { return this._id; }
    get type() { return this._type; }
    get playerId() { return this._playerId; }
    get personalPredictionId() { return this._personalPredictionId; }
    get groupPredictionId() { return this._groupPredictionId; }
    get minute() { return this._minute; }
}
