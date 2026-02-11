// scoring.controller.ts (ili gde ti je logika za scoring)
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CalculatingService } from '../../application/services/calculating.service';

@Controller()
export class CalculatingWorker {
    constructor(private calculatingService: CalculatingService) {}

    // Slušamo ISTI event koji šalješ za Frontend/Gateway
    @EventPattern('update_match')
    async handleMatchUpdate(@Payload() data: any) {
        
        // Proveravamo da li je status 'FT' (Finished Time)
        // I da li je meč već obrađen (ovo možeš proveriti i u servisu)
        if (data.status === 'FT') {
            console.log(`⚡ Event primljen: Meč ${data.id} je završen. Pokrećem bodovanje...`);
            
            // Pozivamo servis da obradi TAJ JEDAN meč odmah
            await this.calculatingService.calculateScores(data);
        }
    }
}