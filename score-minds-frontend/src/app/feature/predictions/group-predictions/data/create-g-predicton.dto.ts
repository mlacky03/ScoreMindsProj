import { PredictionEventCreateDto } from "../../personal-predictions/data/prediction-event/prediction-event-create.dto";

export interface CreateGroupPredictionDto {
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;

    winner: string;

    events: PredictionEventCreateDto[];

    matchId: number;
}