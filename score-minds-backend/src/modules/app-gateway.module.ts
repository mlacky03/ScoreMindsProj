import { AppGateway } from "src/gateway/app.gateway";
import { Module } from "@nestjs/common";
import { UserValidationService } from "src/common/services/user-validation.service";
import { AuthModule } from "./auth.module";
import { RabbitMQModule } from "src/infrastucture/messaging/rabbitmq.module";
import { UserModule } from "./user.module";
import { forwardRef } from "@nestjs/common";

@Module({
  imports: [forwardRef(() => AuthModule),
      RabbitMQModule,
      forwardRef(() => UserModule)
    ],
  providers: [AppGateway,   UserValidationService],
  exports: [AppGateway], 
})
export class GatewayModule {}