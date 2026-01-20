import { Prediction } from "../prediction.entity";
import { CreatePredictionDto } from "./create-prediction.dto";
import { PartialType } from "@nestjs/mapped-types";
export class UpdatePredictionDto extends PartialType(CreatePredictionDto){}
