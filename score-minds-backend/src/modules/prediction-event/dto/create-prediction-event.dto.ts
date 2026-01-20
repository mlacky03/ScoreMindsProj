import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from "class-validator";
import { ValidateNested,IsNotEmpty } from "class-validator";

export class CreatePredictionEventDto {
    @IsNumber()
    @IsNotEmpty()
    playerId: number; 

    @IsEnum(['GOAL', 'ASSIST', 'YELLOW_CARD','RED_CARD'],)
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    @IsNumber()
    minute:number;
}