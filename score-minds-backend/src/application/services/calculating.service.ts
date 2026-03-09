import { Inject, Injectable, Logger } from '@nestjs/common';
import { Match } from 'src/domain/models/match.model';
import { MatchRepository } from 'src/infrastucture/persistence/repositories/match.repository';
import { PersonalPredictionRepository } from 'src/infrastucture/persistence/repositories/personal-prediction.repository';
import { PredictionStatus } from 'src/infrastucture/persistence/entities/personal-prediction.entity';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { GroupPredictionRepository } from 'src/infrastucture/persistence/repositories/group-prediction.repository';
import { StandardPointsStrategy } from '../interfaces/points-strategies-pattern/standard-points-strategy';

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
        private personalPredictionRepo: PersonalPredictionRepository,
        @Inject(GroupPredictionRepository)
        private groupPredictionRepo: GroupPredictionRepository,
        @Inject('RABBITMQ_SERVICE')
        private readonly rabbitClient: ClientProxy,
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
        this.logger.log(`Starting processing for match: ${match.homeTeamName} vs ${match.awayTeamName}`);

        const actualWinner = this.getWinner(match.finalScoreHome!, match.finalScoreAway!);

        try {
            await this.processPersonalPredictions(match, actualWinner);

            await this.processGroupPredictions(match, actualWinner);

            match.computed();
            await this.matchRepo.save(match);

            this.logger.log(`Match ${match.id} calculation DONE.`);
        } catch (error) {
            this.logger.error(`Failed to process match ${match.id}:`, error);
            
        }
    }

    private async processPersonalPredictions(match: Match, actualWinner: string) {
        

        const personalPredictions=await this.personalPredictionRepo.findByMatchId(match.id!);
        if(personalPredictions.length === 0) {
            this.logger.log(`No personal predictions found for match: ${match.id}`)
            return;
        }
        const calculationStrategy = new StandardPointsStrategy();
        const updatePromises = personalPredictions.map(async (prediction) => {
            let totalPoints = calculationStrategy.calculatePoints(prediction, match, actualWinner);

            prediction.addPoints(totalPoints);
            prediction.updateStatus(PredictionStatus.PROCESSED);
            
            await this.personalPredictionRepo.save(prediction);
            this.rabbitClient.emit('prediction-computed', {
                userId: prediction.userId,
                predictionId: prediction.id,
                points: totalPoints,
                status: PredictionStatus.PROCESSED

            });

            this.rabbitClient.emit('personal-list-changed', {userId: prediction.userId,status: PredictionStatus.PROCESSED,predictionId:prediction.id,points:totalPoints});
            // this.appGateway.sendNotificationToUser(prediction.userId, {
            //     title: 'Rezultati su stigli!',
            //     message: `Osvojio si ${totalPoints} poena na utakmici ${match.homeTeamName} - ${match.awayTeamName}`,
            //     matchId: match.id,
            //     points: totalPoints
            // });
        });

        await Promise.all(updatePromises);

       
        match.computed();
        await this.matchRepo.save(match);


    }

    private async processGroupPredictions(match:Match,actualWinner:string){
        const groupPredictions=await this.groupPredictionRepo.findByMatchId(match.id!);
        if(groupPredictions.length === 0) {
            this.logger.log(`No group predictions found for match: ${match.id}`)
            return;
        }
        const calculationStrategy = new StandardPointsStrategy();
        const updatePromises = groupPredictions.map(async (prediction) => {
            let totalPoints = calculationStrategy.calculatePoints(prediction, match, actualWinner);

           

            prediction.addPoints(totalPoints);
            prediction.updateStatus(PredictionStatus.PROCESSED);
            
            await this.groupPredictionRepo.save(prediction);
            this.rabbitClient.emit('prediction-computed-group', {
                groupId: prediction.groupId,
                predictionId: prediction.id,
                points: totalPoints,
                status: PredictionStatus.PROCESSED

            });

            this.rabbitClient.emit('prediction-list-changed', {predictionId: prediction.id,status: PredictionStatus.PROCESSED,totalPoints: totalPoints});
            // this.appGateway.sendNotificationToUser(prediction.userId, {
            //     title: 'Rezultati su stigli!',
            //     message: `Osvojio si ${totalPoints} poena na utakmici ${match.homeTeamName} - ${match.awayTeamName}`,
            //     matchId: match.id,
            //     points: totalPoints
            // });
        });

        await Promise.all(updatePromises);

       
        match.computed();
        await this.matchRepo.save(match);


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