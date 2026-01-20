import { CreatePredictionDto } from "src/modules/prediction/dto/create-prediction.dto";
import {PartialType} from "@nestjs/mapped-types";
export class UpdatePredictionEventDto extends PartialType(CreatePredictionDto){}