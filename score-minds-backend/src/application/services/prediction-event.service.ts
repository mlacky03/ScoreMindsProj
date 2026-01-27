import { Inject, Injectable } from "@nestjs/common"
import { PredictionEvent } from "src/domain/models/prediction-event.model"
import { CreatePredictionEventDto } from "../dtos/prediction-event-dto/create-prediction-event.dto"
import { FullPredictionEventDto } from "../dtos/prediction-event-dto/full-prediction-event.dto"
import { UpdatePredictionEventDto } from "../dtos/prediction-event-dto/update-prediction-event.dto"
import { PlayerService } from "./player.service"
import { PredictionEventRepository } from "src/infrastucture/persistence/repositories/prediction-event.repository"
import { BasePredictionEventDto } from "../dtos/prediction-event-dto/base-prediction-event.dto"
import { FullPlayerDto } from "../dtos/players-dto/full-player.dto"

@Injectable()
export class PredictionEventService  {
    constructor(
        @Inject(PredictionEventRepository)
        private readonly repo: PredictionEventRepository,
        private readonly playerService: PlayerService
    ) {
       
    }

    async createPredictionEvent(predictionEvent: CreatePredictionEventDto,group:boolean): Promise<PredictionEvent> {
        const pe= new PredictionEvent(
            null,
            predictionEvent.type,
            predictionEvent.playerId,
            null,
            null,
            predictionEvent.minute
        )
        group?pe.updateGroupPredictionId(predictionEvent.predictionId):pe.updatePredictionId(predictionEvent.predictionId);
        return this.repo.save(pe);
    }
    
    async findAll(predictionId: number): Promise<BasePredictionEventDto[]> {
        const data = await this.repo.findByPredictionId(predictionId);
        return data.map(event => new BasePredictionEventDto(event));
    }

    
    async findOne(id: number): Promise<FullPredictionEventDto | null> {
        const data = await this.repo.findById(id);
        if (!data) return null;
        const player = await this.playerService.findOne(data.playerId);
        if (!player) {
            throw new Error(`Igrač sa ID-jem ${data.playerId} nije pronađen.`);
        }
        // const prediction = await this.repo.findByPredictionId(data.predictionId);
        // if (!prediction) {
        //     throw new Error(`Predviđanje sa ID-jem ${data.predictionId} nije pronađeno.`);
        // }
        return new FullPredictionEventDto(data,player);
    }

    async update(id: number, predictionEvent: UpdatePredictionEventDto): Promise<FullPredictionEventDto | BasePredictionEventDto|null> {
        const data = await this.repo.findById(id);
        if (!data) return null;
        const cleanData = Object.fromEntries(
            Object.entries(predictionEvent).filter(([_, value]) => value !== null && value !== undefined)
        );
        const { playerId, ...rest } = cleanData;
        let player: FullPlayerDto | null = null;
        //Object.assign(data, rest); // ovo radi samo za podatke koji nisu relacije zato mora za player posebno
       data.updatePredictionEvent(rest.type,rest.minute);
        if (playerId) {
            // player = await this.playerService.findOne(playerId);
            // if (!player) {
            //     throw new Error(`Igrač sa ID-jem ${playerId} nije pronađen.`);
            // }
            // if (player.teamId !== hometeamId && player.teamId !== awayteamId) {
            //     throw new Error(`Igrač sa ID-jem ${predictionEvent.playerId} nije u niti jednoj ekipi.`);
            // }
            
            data.updatePlayerId(playerId);
        }
        await this.repo.save(data);
        return  player ? new FullPredictionEventDto(data,player):new BasePredictionEventDto(data);
    }

    async delete(id: number): Promise<boolean> {
        const data = await this.repo.findById(id);
        if (!data) return false;
        await this.repo.delete(id);
        return true;
    }

    async deleteMany(predictionIds: number[]): Promise<void> {
    
        await this.repo.deleteMany(predictionIds);
    }
}
