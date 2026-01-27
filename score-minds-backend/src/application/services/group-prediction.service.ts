import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { GroupPredictionRepository } from "src/infrastucture/persistence/repositories/group-prediction.repository";
import { PersonalPredictionRepository } from "src/infrastucture/persistence/repositories/personal-prediction.repository";
import { PredictionEventService } from "./prediction-event.service";
import { MatchService } from "./matches.service";
import { PredictionAuditService } from "./prediction-audit.service";
import { PlayerService } from "./player.service";
import { BasePredictionDto } from "../dtos/group-prediction-dto/base-prediction.dto";
import { CreatePredictionDto } from "../dtos/group-prediction-dto/create-prediction.dto";
import { FullPredictionDto } from "../dtos/group-prediction-dto/full-prediction.dto";
import { UpdatePredictionDto } from "../dtos/group-prediction-dto/update-prediction.dto";
import { FullMatchDto } from "../dtos/matches-dto/full-match.dto";
import { GroupPrediction } from "src/domain/models/group-prediction.model";
import { PredictionStatus } from "src/infrastucture/persistence/entities/group-prediction.entity";
import { GroupService } from "./group.service";


@Injectable()
export class GroupPredictionService {
    constructor(
        @Inject(GroupPredictionRepository)
        private readonly repo: GroupPredictionRepository,
        private readonly predictionEventService: PredictionEventService,
        private readonly matchService: MatchService,
        private readonly predictionAuditService: PredictionAuditService,
        private readonly playerService: PlayerService,
        private readonly groupService:GroupService
    ) { }

    async findAll(id: number,userId:number): Promise<BasePredictionDto[]> {
            await this.groupService.chackMembership(userId, id);
            const res = await this.repo.findByGroupId(id);
    
            return res.map((p) => new BasePredictionDto(p));
        }
    
        async createPrediction(groupId: number, prediction: CreatePredictionDto,userId:number): Promise<FullPredictionDto> {
    
            const match = await this.matchService.findOne(prediction.matchId);
            if (!match) {
                throw new NotFoundException(`Meč sa ID-jem ${prediction.matchId} nije pronađen.`);
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
            const data = new GroupPrediction(
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
                groupId,
                PredictionStatus.DRAFT,
                userId,
                userId

                
                
            );
            const savedPrediction = await this.repo.save(data);
    
    
            if (prediction.events && prediction.events.length > 0) {
                for (const eventDto of prediction.events) {
                    await this.predictionEventService.createPredictionEvent({ ...eventDto, predictionId: savedPrediction.id! },true);
                }
            }
    
            const fullPrediction = await this.findOne(savedPrediction.id!, groupId,userId);
            //await this.predictionAuditService.createAudit(fullPrediction);
    
    
            return fullPrediction;
        }
    
        async findOne(id: number, groupId: number,userId:number): Promise<FullPredictionDto> {
            await this.groupService.chackMembership(userId, groupId);
            const prediction = await this.repo.findPredictionByGroupIdWithRelations(groupId,id);
    
            if (!prediction) {
                throw new NotFoundException('Prediction not found');
            }
            return new FullPredictionDto(prediction);
        }
    
    
        async updatePrediction(predictionId: number, userId: number, predictionDto: UpdatePredictionDto,groupId:number): Promise<FullPredictionDto> {
            await this.groupService.chackMembership(userId, groupId);
            const prediction = await this.repo.findPredictionByGroupIdWithRelations(groupId, predictionId);
            if (!prediction) throw new NotFoundException('Prediction not found');
    
            const cleanData = Object.fromEntries(
                Object.entries(predictionDto).filter(([_, value]) => value !== null && value !== undefined)
            );
            const snapshotBeforeUpdate = { ...prediction } as GroupPrediction;
            const { events, matchId, ...restData } = cleanData;
            let match;
            if (matchId) {
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
            prediction.updatePrediction(restData.predictedHomeScore,restData.predictedAwayScore,restData.winner);
    
            if (events) {
                const promises = events.map(async (p) => {
                    const exists = prediction.predictedEvents.find(e => e.id === p.id);
    
                    if (!exists) {
                        return this.predictionEventService.createPredictionEvent(
                            { ...p, predictionId: prediction.id },
                            true
                        );
                    } else {
                        return this.predictionEventService.update(
                            p.id,
                            p,

                        );
                    }
                });
    
                await Promise.all(promises);
            }
            
            prediction.setEventsNull();
            await this.repo.save(prediction);
    
    
            //await this.predictionAuditService.createUpdateAudit(snapshotBeforeUpdate, prediction);
    
            const freshPrediction = await this.repo.findPredictionByGroupIdWithRelations(groupId, predictionId);
    
            return new FullPredictionDto(freshPrediction!);
    
        }
        async deletePrediction(predictionId: number, groupId: number,userId:number): Promise<{ message: string }> {
            const prediction = await this.repo.findByGroupIdWithoutRelations(groupId, predictionId);
            if (!prediction) throw new NotFoundException('Prediction not found');
            if(prediction.createdById!==userId){
                throw new ForbiddenException("You are not the creator of this prediction");
            }
            await this.repo.delete(predictionId);
            return { message: 'Prediction deleted successfully' };
        }
    
    
        async deleteManyPredictions(predictionIds: number[],userId:number): Promise<void> {
            await this.groupService.chackMembership(userId, predictionIds[0]);
            await this.repo.deleteMany(predictionIds);
        }
}