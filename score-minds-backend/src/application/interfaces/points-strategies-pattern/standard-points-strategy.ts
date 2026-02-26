import { Match } from "src/domain/models/match.model";
import { IPointsCalculationStrategy } from "./ipoints-strategy";

export class StandardPointsStrategy implements IPointsCalculationStrategy {
    private readonly POINTS_EXACT_SCORE = 10;

    private readonly POINTS_EXACT_MINUTE_ASSIST = 15;
    private readonly POINTS_EXACT_MINUTE_GOAL  = 30;
    private readonly POINTS_WINNER = 3;
    private readonly POINTS_EVENT_GOAL = 2;
    private readonly POINTS_EVENT_ASSIST = 1;
    calculatePoints(prediction: any, match: any, actualWinner: string): number {
        let totalPoints=0;

        if (prediction.winner === actualWinner) {
            totalPoints += this.POINTS_WINNER;
        }

        if (
            prediction.predictedHomeScore === match.finalScoreHome &&
            prediction.predictedAwayScore === match.finalScoreAway
        ) {
            totalPoints += this.POINTS_EXACT_SCORE;
        }
         if (prediction.predictedEvents && prediction.predictedEvents.length > 0) {
                const eventPoints = this.calculateEvents(prediction.predictedEvents, match);
                totalPoints += eventPoints;
            }

        return totalPoints;
    }

    calculateEvents(predictedEvents:any[],match:Match):number
    {
        let points = 0;

        for (const pEvent of predictedEvents) {
            const matchingRealEvents = match.events.filter(
                real => real.type === pEvent.type && real.playerId === pEvent.playerId
            );

            if (matchingRealEvents.length === 0) continue;

            if (pEvent.minute) {
                const exactMinuteHit = matchingRealEvents.some(real => real.minute === pEvent.minute);

                if (exactMinuteHit) {
                    
                    points += (pEvent.type === 'GOAL') ? this.POINTS_EXACT_MINUTE_GOAL : this.POINTS_EXACT_MINUTE_ASSIST;
                } 
            } else {

                points += (pEvent.type === 'GOAL') ? this.POINTS_EVENT_GOAL : this.POINTS_EVENT_ASSIST;
            }
        }
        return points;
    }
}