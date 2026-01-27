import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { EventType } from "src/infrastucture/persistence/entities/prediction-event.entity";
export class CreatePredictionEventDto {
    @IsNumber()
    @IsNotEmpty()
   
    playerId: number; 

    @IsEnum(['GOAL', 'ASSIST', 'YELLOW_CARD','RED_CARD'],)
    @IsNotEmpty()
    @IsString()
   
    type: EventType;

    @IsOptional()
    @IsNumber()
    
    minute:number;

    @IsNumber()
    @IsNotEmpty()
    predictionId: number; 
}
