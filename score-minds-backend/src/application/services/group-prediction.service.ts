import { Inject, Injectable } from "@nestjs/common";
import { GroupPredictionRepository } from "src/infrastucture/persistence/repositories/group-prediction.repository";


@Injectable()
export class GroupPredictionService{
    constructor(
        @Inject(GroupPredictionRepository)
        private groupPredictionRepository:GroupPredictionRepository
    ){}
}