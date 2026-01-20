import { Injectable } from "@nestjs/common"
import { Prediction } from "../prediction/prediction.entity"
import { BaseService } from "src/common/services/base.service"
import { PredictionEvent } from "./prediction-event.entity"
@Injectable()
export class PredictionEventService extends BaseService<PredictionEvent>{
    
}
