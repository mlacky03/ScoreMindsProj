import { CreatePredictionEventDto } from "./create-prediction-event.dto";
import {PartialType} from "@nestjs/mapped-types";
import { IsNumber, IsOptional } from "class-validator";
export class UpdatePredictionEventDto extends PartialType(CreatePredictionEventDto){
    @IsOptional()
    @IsNumber()
    id?: number;
}