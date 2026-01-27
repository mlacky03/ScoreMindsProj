import { UpdatePredictionDto } from "src/application/dtos/personal-prediction-dto/update-prediction.dto";
import { WinnerOption } from "../enums/CreateOption";
import { Match } from "./match.model";
import { PredictionEvent } from "./prediction-event.model";

export abstract class BasePrediction{
    constructor(
            private _id: number | null,
            private _matchId: number,
            private _predictedHomeScore: number | null,
            private _predictedAwayScore: number | null,
            private _winner: WinnerOption ,
            private _pointsWon: number = 0,
            private _createdAt: Date = new Date(),
            private _updatedAt: Date | null = null,
            private _predictedEvents: PredictionEvent[] = [] ,
            private _match:Match|null
        ) {
            this.validateScores(_predictedHomeScore, _predictedAwayScore);
        }

        public updateScore(home: number, away: number): void {
        this.validateScores(home, away);
        
        this._predictedHomeScore = home;
        this._predictedAwayScore = away;
        this._updatedAt = new Date();

        
        if (home > away) {
            this._winner = WinnerOption.HOME;
        } else if (away > home) {
            this._winner = WinnerOption.AWAY;
        } else {
            this._winner = WinnerOption.DRAW;
        }
    }

        public addPoints(points: number): void {
                if (points < 0) throw new Error("Poeni ne mogu biti negativni.");
                this._pointsWon += points;
            }
        
            public resetPoints(): void {
                this._pointsWon = 0;
            }
        
            private validateScores(home: number | null, away: number | null): void {
                if (home !== null && home < 0) throw new Error("Domaći rezultat ne može biti negativan.");
                if (away !== null && away < 0) throw new Error("Gostujući rezultat ne može biti negativan.");
            }
        
            public updateMatchId(matchId: number): void {
                this._matchId = matchId;
        
            }
            public setEventsNull(): void {
                this._predictedEvents = [];
            }
        
            public updatePrediction(hScore:number,aScore:number,winner:WinnerOption): void {
                this._predictedAwayScore=aScore;
                this._predictedHomeScore=hScore;
                if(this._predictedAwayScore!==null && this._predictedHomeScore!==null){
                    this.updateScore(this._predictedHomeScore,this._predictedAwayScore);
                }
                else{
                    this._winner=winner;
                }
                
            }
        
        
            
            get id() { return this._id; }
            get matchId() { return this._matchId; }
            get predictedHomeScore() { return this._predictedHomeScore; }
            get predictedAwayScore() { return this._predictedAwayScore; }
            get winner() { return this._winner; }
            get pointsWon() { return this._pointsWon; }
            get createdAt() { return this._createdAt; }
            get updatedAt() { return this._updatedAt; }
            get predictedEvents() { return this._predictedEvents; }
            get match() { return this._match; }
}