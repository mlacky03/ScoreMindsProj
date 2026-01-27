import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PredictionEventRepository } from "src/infrastucture/persistence/repositories/prediction-event.repository";

@Controller()
export class PredictionEventWorker{
    constructor(
        private readonly predictionRepo: PredictionEventRepository
    ) {}

    @EventPattern('update_event')
    async handleUpdateEvent(@Payload() data: any) {
        
    }
}