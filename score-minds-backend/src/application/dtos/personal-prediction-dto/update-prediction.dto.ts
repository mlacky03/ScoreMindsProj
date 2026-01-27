import { CreatePredictionDto } from "./create-prediction.dto";
import { PartialType,OmitType } from "@nestjs/mapped-types";
import { IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";   
import { UpdatePredictionEventDto } from "../prediction-event-dto/update-prediction-event.dto";

export class UpdatePredictionDto extends PartialType(
    OmitType(CreatePredictionDto, ['events'] as const)
) {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePredictionEventDto)
    events?: UpdatePredictionEventDto[];

   
}