import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from 'src/domain/models/match.model';
import { PersonalPrediction } from 'src/domain/models/personal-prediction.model';
import { AppGateway } from 'src/gateway/app.gateway';
import { MatchRepository } from 'src/infrastucture/persistence/repositories/match.repository';
import { PersonalPredictionRepository } from 'src/infrastucture/persistence/repositories/personal-prediction.repository';
import { PredictionStatus } from 'src/infrastucture/persistence/entities/personal-prediction.entity';
import { EventPattern, Payload } from '@nestjs/microservices';

@Injectable()
export class CalculatingService {
    private readonly logger = new Logger(CalculatingService.name);

    
    private readonly POINTS_EXACT_SCORE = 10;

    private readonly POINTS_EXACT_MINUTE_ASSIST = 15;
    private readonly POINTS_EXACT_MINUTE_GOAL  = 30;
    private readonly POINTS_WINNER = 3;
    private readonly POINTS_EVENT_GOAL = 2;
    private readonly POINTS_EVENT_ASSIST = 1;

    constructor(
        @Inject(MatchRepository)
        private matchRepo: MatchRepository,
        @Inject(PersonalPredictionRepository)
        private predictionRepo: PersonalPredictionRepository,
        private appGateway: AppGateway, 
    ) { }

    
    async calculateScores(data:any) {
        
        
        const match=await this.matchRepo.findById(data.id);
        if(!match) {
            this.logger.log(`Match not found: ${data.id}`);
            return;
        }
        if(match.isComputed)
        {
            this.logger.log(`Match already computed: ${data.id}`);
            return;
        }

        await this.processMatch(match);
        
    }

    private async processMatch(match: Match) {
        this.logger.log(`Calculating scores for match: ${match.homeTeamName} vs ${match.awayTeamName}`);

        const actualWinner = this.getWinner(match.finalScoreHome!, match.finalScoreAway!);

        const personalPredictions=await this.predictionRepo.findByMatchId(match.id!);
        if(personalPredictions.length === 0) {
            this.logger.log(`No predictions found for match: ${match.id}`);
            match.computed();
            await this.matchRepo.save(match);
            return;
        }
        const updatePromises = personalPredictions.map(async (prediction) => {
            let totalPoints = 0;

            if (prediction.winner === actualWinner) {
                totalPoints += this.POINTS_WINNER;
            }

            if (
                prediction.predictedHomeScore === match.finalScoreHome &&
                prediction.predictedAwayScore === match.finalScoreAway
            ) {
                totalPoints += this.POINTS_EXACT_SCORE;
            }

            if (prediction.predictedEvents && prediction.predictedEvents.length > 0) {
                const eventPoints = this.calculateEventPoints(prediction.predictedEvents, match);
                totalPoints += eventPoints;
            }

            prediction.addPoints(totalPoints);
            prediction.updateStatus(PredictionStatus.PROCESSED);
            
            await this.predictionRepo.save(prediction);

            this.appGateway.sendNotificationToUser(prediction.userId, {
                title: 'Rezultati su stigli!',
                message: `Osvojio si ${totalPoints} poena na utakmici ${match.homeTeamName} - ${match.awayTeamName}`,
                matchId: match.id,
                points: totalPoints
            });
        });

        await Promise.all(updatePromises);

       
        match.computed();
        await this.matchRepo.save(match);

        this.logger.log(`Match ${match.id} calculation DONE.`);
    }


    private calculateEventPoints(predictedEvents: any[], match: Match): number {
        let points = 0;

        for (const pEvent of predictedEvents) {
            const matchingRealEvents = match.events.filter(
                real => real.type === pEvent.type && real.playerId === pEvent.playerId
            );

            if (matchingRealEvents.length === 0) continue;

            if (pEvent.minute) {
                const exactMinuteHit = matchingRealEvents.some(real => real.minute === pEvent.minute);

                if (exactMinuteHit) {
                    
                    points += (pEvent.type === 'GOAL') ? this.POINTS_EXACT_MINUTE_GOAL : this.POINTS_EXACT_MINUTE_ASSIST;
                } 
            } else {

                points += (pEvent.type === 'GOAL') ? this.POINTS_EVENT_GOAL : this.POINTS_EVENT_ASSIST;
            }
        }
        return points;
    }


    private getWinner(home: number, away: number): 'HOME' | 'AWAY' | 'DRAW' {
        if (home > away) return 'HOME';
        if (away > home) return 'AWAY';
        return 'DRAW';
    }
}