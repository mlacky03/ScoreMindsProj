import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Global() // 👈 
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE', 
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@rabbitmq:5672'], 
          queue: 'prediction_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule], 
})
export class RabbitMQModule {}