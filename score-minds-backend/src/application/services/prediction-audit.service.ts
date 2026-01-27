import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PredictionAudit } from "src/domain/models/prediction-audit.model";
import { PersonalPrediction } from "src/domain/models/personal-prediction.model";
import { FullPredictionAuditDto } from "../dtos/prediction-audit-dto/full-prediction-audit.dto";
import { CreateOption } from "src/domain/enums/CreateOption";
import { PredictionAuditRepository } from "src/infrastucture/persistence/repositories/prediction-audit";
import { PersonalPredictionRepository } from "src/infrastucture/persistence/repositories/personal-prediction.repository";
import { FullPredictionDto } from "../dtos/personal-prediction-dto/full-prediction.dto";

function getDifferences(oldObj: any, newObj: any) {
    const changes: any = {};

    const keysToTrack = ['predictedHomeScore', 'predictedAwayScore', 'matchId', 'winner'];

    for (const key of keysToTrack) {
        if (oldObj[key] != newObj[key]) {
            changes[key] = {
                old: oldObj[key],
                new: newObj[key]
            };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
}

@Injectable()
export class PredictionAuditService  {
    constructor(
        @Inject(PredictionAuditRepository)
        private readonly predictionAuditRepository: PredictionAuditRepository,
        @Inject(PersonalPredictionRepository)
        private readonly predictionRepo: PersonalPredictionRepository
    ) {
        
    }

    async createUpdateAudit(oldPrediction: PersonalPrediction, newPrediction: PersonalPrediction) {
        const differences = getDifferences(oldPrediction, newPrediction);
        const option = CreateOption.UPDATE;
        if (differences) {
            await this.predictionAuditRepository.save(new PredictionAudit(null, newPrediction.id!, newPrediction.userId, option, differences))
        }
    }

    async createAudit(newPrediction: FullPredictionDto) {
        const option = CreateOption.CREATE;

        await this.predictionAuditRepository.save(new PredictionAudit(null, newPrediction.id!, newPrediction.userId, option, { initialState: newPrediction }))

    }

    async getAuditByPredictionId(predictionId: number, userId: number) {
        const prediction = await this.predictionRepo.findByUserWithoutRelations(userId, predictionId);
        if (!prediction) {
            throw new NotFoundException('Prediction not found');
        }

        const audits = await this.predictionAuditRepository.findByPredictionId(predictionId);

        return audits?.map(audit => new FullPredictionAuditDto(audit));
    }

}
