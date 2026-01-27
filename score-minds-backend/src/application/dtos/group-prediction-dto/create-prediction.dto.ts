import { Type } from "class-transformer";
import { WinnerOption } from "src/domain/enums/CreateOption";
import { IsString, IsOptional, IsNumber, IsEnum, ValidateNested, IsArray } from "class-validator";
import { CreatePredictionEventDto } from "../prediction-event-dto/create-prediction-event.dto";


export class CreatePredictionDto {
    @IsOptional()
    @IsNumber()
    predictedHomeScore: number;

    @IsOptional()
    @IsNumber()
    predictedAwayScore: number;

    @IsOptional()
    @IsEnum(WinnerOption, {
        message: 'Winner mora biti jedna od opcija: HOME, AWAY ili DRAW'
    })
    @IsString()
    winner: WinnerOption;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePredictionEventDto)
    events: CreatePredictionEventDto[];

    @IsOptional()
    @IsNumber()
    matchId: number;

    @IsNumber()
    groupId: number;

}