import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray } from "class-validator";
import { PredictionEventCreateDto } from "./prediction-event/prediction-event-create.dto";


export interface CreateUserPredictionDto{

    predictedHomeScore: number|null;
    predictedAwayScore: number|null;

    winner: string;

    events: PredictionEventCreateDto[];

    matchId: number;
}