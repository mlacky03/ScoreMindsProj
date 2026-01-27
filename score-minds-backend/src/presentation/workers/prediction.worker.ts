import { Controller } from "@nestjs/common";
import { PersonalPredictionRepository } from "src/infrastucture/persistence/repositories/personal-prediction.repository";

@Controller()
export class PredictionWorker{
    constructor(
        private readonly predictionRepo: PersonalPredictionRepository
    ) {}
    
}