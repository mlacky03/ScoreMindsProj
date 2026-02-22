import { PredictionEventUpdateDto } from "../../personal-predictions/data/prediction-event/prediction-event-update.dto";

export interface UpdateGroupPredictionDto {
    predictedHomeScore?: number;
    predictedAwayScore?: number;
    winner?: string;
    matchId: number;
    events?: PredictionEventUpdateDto[];
}