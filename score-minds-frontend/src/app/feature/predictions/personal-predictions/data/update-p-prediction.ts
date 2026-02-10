import { PredictionEventUpdateDto } from "./prediction-event/prediction-event-update.dto";

export interface UpdateUserPredictionDto
{
        predictedHomeScore?: number;
        predictedAwayScore?: number;
        winner?: string;
        matchId: number;
        events?: PredictionEventUpdateDto[];

}