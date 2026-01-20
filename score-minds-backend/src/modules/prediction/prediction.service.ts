import { Injectable } from "@nestjs/common";
import { Prediction } from "./prediction.entity";
import { BaseService } from "src/common/services/base.service";
import { Repository } from "typeorm";
import { BasePredictionDto } from "./dto/base-prediction.dto";
import { CreatePredictionDto } from "./dto/create-prediction.dto";
import { PredictionEvent } from "../prediction-event/prediction-event.entity";
import { CreatePredictionEventDto } from "../prediction-event/dto/create-prediction-event.dto";
@Injectable()
export class PrdictionService extends BaseService<Prediction>
{
    constructor(
        private readonly repo:Repository<Prediction>
    ){
        super(repo);
    }

    async findAll(id:number):Promise<BasePredictionDto[]>
    {
        const res= await this.repo.find({
            where:{user:{id:id}},
            relations:['predictionEvent']
        });

        return res.map((p)=>new BasePredictionDto(p));
    }

    async createPrediction(userId:number,prediction:CreatePredictionDto,events:CreatePredictionEventDto[]):Promise<Prediction>
    {

        const data= this.repo.create({...prediction, user:{id:userId},match:{id:prediction.matchId}});
        await this.repo.save(data);

        if (events && events.length > 0) {
            
        }
        return data;
    }

}