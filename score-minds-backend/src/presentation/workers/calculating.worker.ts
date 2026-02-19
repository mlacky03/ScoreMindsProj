// scoring.controller.ts (ili gde ti je logika za scoring)
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CalculatingService } from '../../application/services/calculating.service';
import { AppGateway } from 'src/gateway/app.gateway';

@Controller()
export class CalculatingWorker {
    constructor(private calculatingService: CalculatingService,
               // private appGateway:AppGateway
    ) {}

    
    @EventPattern('match_finished')
    async handleMatchUpdate(@Payload() data: any) {
        
       
         
          
            await this.calculatingService.calculateScores(data);
            //this.appGateway.broadcastMatchStatusChange(data.id, data.status);
        
    }

    // @EventPattern('match_started')
    // handleMatchStarted(@Payload() data: any) {
    //     console.log(`📡 RabbitMQ -> WebSocket: Match started ${data.matchId}`);

    //     this.calculatingService.statusChange(data);
    // }
}