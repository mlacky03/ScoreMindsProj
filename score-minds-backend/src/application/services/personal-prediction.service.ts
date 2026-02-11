import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PersonalPrediction } from "src/domain/models/personal-prediction.model";
import { BasePredictionDto } from "../dtos/personal-prediction-dto/base-prediction.dto";
import { CreatePredictionDto } from "../dtos/personal-prediction-dto/create-prediction.dto";
import { PredictionEventService } from "./prediction-event.service";
import { UpdatePredictionDto } from "../dtos/personal-prediction-dto/update-prediction.dto";
import { FullPredictionDto } from "../dtos/personal-prediction-dto/full-prediction.dto";
import { MatchService } from "./matches.service";
import { PredictionAuditService } from "./prediction-audit.service";
import { PersonalPredictionRepository } from "src/infrastucture/persistence/repositories/personal-prediction.repository";
import { PlayerService } from "./player.service";
import { FullMatchDto } from "../dtos/matches-dto/full-match.dto";
import { PredictionStatus } from "src/infrastucture/persistence/entities/personal-prediction.entity";
@Injectable()
export class PersonalPredictionService {
    constructor(
        @Inject(PersonalPredictionRepository)
        private readonly repo: PersonalPredictionRepository,
        private readonly predictionEventService: PredictionEventService,
        private readonly matchService: MatchService,
        private readonly predictionAuditService: PredictionAuditService,
        private readonly playerService: PlayerService
    ) {

    }

    async findAll(id: number): Promise<BasePredictionDto[]> {
        const res = await this.repo.findByUserId(id);

        return res.map((p) => new BasePredictionDto(p));
    }

    async createPrediction(userId: number, prediction: CreatePredictionDto): Promise<FullPredictionDto> {

        const match = await this.matchService.findOne(prediction.matchId);
        const matchTime = new Date(match.startTime).getTime(); // Sigurno pretvara string ili Date u broj
        const now = new Date().getTime();
        if (!match) {
            throw new NotFoundException(`Meč sa ID-jem ${prediction.matchId} nije pronađen.`);
        }
        if(matchTime < now) {
            throw new BadRequestException(`Meč sa ID-jem ${prediction.matchId} je već počeo.`);
        }
        if (prediction.events && prediction.events.length > 0) {
            for (const eventDto of prediction.events) {

                const player = await this.playerService.findOne(eventDto.playerId);
                if (!player) {
                    throw new BadRequestException(`Igrač sa ID ${eventDto.playerId} ne postoji.`);
                }

                if (player.teamId !== match.hometeamId && player.teamId !== match.awayteamId) {
                    throw new BadRequestException(`Igrač ${player.name} ne igra za timove u ovom meču.`);
                }
            }
        }
        const data = new PersonalPrediction(
            null,
            prediction.matchId,
            prediction.predictedHomeScore,
            prediction.predictedAwayScore,
            prediction.winner,
            0,
            new Date(),
            null,
            [],
            null,
            userId,
            PredictionStatus.SUBMITTED
        );
        const savedPrediction = await this.repo.save(data);


        if (prediction.events && prediction.events.length > 0) {
            for (const eventDto of prediction.events) {
                await this.predictionEventService.createPredictionEvent({ ...eventDto, predictionId: savedPrediction.id! },false);
            }
        }

        const fullPrediction = await this.findOne(savedPrediction.id!, userId);
        await this.predictionAuditService.createAudit(fullPrediction);


        return fullPrediction;
    }

    async findOne(id: number, userId: number): Promise<FullPredictionDto> {

        const prediction = await this.repo.findPredictionByUserWithRelations(userId, id);

        if (!prediction) {
            throw new NotFoundException('Prediction not found');
        }
        return new FullPredictionDto(prediction);
    }


    async updatePrediction(predictionId: number, userId: number, predictionDto: UpdatePredictionDto): Promise<FullPredictionDto> {
        const prediction = await this.repo.findPredictionByUserWithRelations(userId, predictionId);
        if (!prediction) throw new NotFoundException('Prediction not found');
        const matchTime = new Date(prediction.match!.startTime).getTime(); 
        const now = new Date().getTime();
        if(matchTime < now) {
            throw new BadRequestException('Mec je vec poceo ne mozes uraditi update');
        }
        const cleanData = Object.fromEntries(
            Object.entries(predictionDto).filter(([_, value]) => value !== null && value !== undefined)
        );
        const snapshotBeforeUpdate = { ...prediction } as PersonalPrediction;
        const { events, matchId, ...restData } = cleanData;
        let match;
        if (matchId&&matchId!==prediction.matchId) {
            match = await this.matchService.findOne(matchId);
            prediction.updateMatchId(matchId);
            const p=prediction.predictedEvents.map(e=>e.id as number);
            if(p.length>0)
            {
                await this.predictionEventService.deleteMany(p);
                prediction.setEventsNull();
            }
        }
        else {
            match = new FullMatchDto(prediction.match!);
           
        }
        if (predictionDto.events && predictionDto.events.length > 0) {
            const playerIds = predictionDto.events.map(e => e.playerId!);
            const uniquePlayerIds = [...new Set(playerIds)];
            const players = await this.playerService.findMany(uniquePlayerIds);
            if (players.length !== uniquePlayerIds.length) {
                throw new BadRequestException('Jedan ili više igrača ne postoje.');
            }
            const validTeamIds = [match.hometeamId, match.awayteamId];
            for (const player of players) {
                if (!validTeamIds.includes(player.teamId)) {
                    throw new BadRequestException(`Igrač ${player.name} ne igra za timove u ovom meču.`);
                }
            }
        }

        //Object.assign(prediction, restData);
        const changed=prediction.updatePrediction(restData.predictedHomeScore,restData.predictedAwayScore,restData.winner);

        if (events) {
            const promises = events.map(async (p) => {
                const exists = prediction.predictedEvents.find(e => e.id === p.id);

                if (!exists) {
                    return this.predictionEventService.createPredictionEvent(
                        { ...p, predictionId: prediction.id },
                        false
                    );
                } else {
                    const isSame = 
                        exists.playerId === p.playerId &&
                        exists.type === p.type &&
                        exists.minute == p.minute; 

   
                    if (isSame) {
                        return Promise.resolve(exists); 
                    }
                    return this.predictionEventService.update(
                        p.id,
                        p,

                    );
                }
            });

            await Promise.all(promises);
        }
        
        prediction.setEventsNull();
        if(changed)
        {
            await this.repo.save(prediction);
            await this.predictionAuditService.createUpdateAudit(snapshotBeforeUpdate, prediction);
        }
            

        const freshPrediction = await this.repo.findPredictionByUserWithRelations(userId, predictionId);

        return new FullPredictionDto(freshPrediction!);

    }
    async deletePrediction(predictionId: number, userId: number): Promise<{ message: string }> {
        const prediction = await this.repo.findByUserWithoutRelations(userId, predictionId);
        if (!prediction) throw new NotFoundException('Prediction not found');

        await this.repo.delete(predictionId);
        return { message: 'Prediction deleted successfully' };
    }


    async deleteManyPredictions(predictionIds: number[]): Promise<void> {
        await this.repo.deleteMany(predictionIds);
    }
}
