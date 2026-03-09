import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { AppGateway } from "src/gateway/app-gateway";


@Controller()
export class PredictionWorker{
    constructor(
        private readonly appGateway:AppGateway
    ) {}
    @EventPattern('prediction-list-changed')
    handlePredictionListChanged(@Payload() data: any) {
        console.log(`📡 RabbitMQ -> WebSocket: Prediction list changed for group ${data.groupId}`);

        this.appGateway.brodcastPredictionListChagne(data,data.groupId);
    }

    @EventPattern('personal-list-changed')
    handlePersonalListChanged(@Payload() data: any)
    {
        console.log(`📡 RabbitMQ -> WebSocket: Prediction list changed for personal status ${data.userId}`);

        this.appGateway.brodcastPersonalListChange(data);

    }
    @EventPattern('delete_group_prediction')
    handleGroupPredictionDelete(@Payload() data:any)
    {
        console.log(`📡 RabbitMQ -> WebSocket: Group prediction deleted ${data}`);
        this.appGateway.brodcastGroupPredictionDelete(data);
    }
}