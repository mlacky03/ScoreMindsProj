import { PredictionAudit } from "src/domain/models/prediction-audit.model";

export class FullPredictionAuditDto {
    predictionId: number;
    userId: number;
    action: string;
    changes: any;
    createdAt: Date;
    constructor(PredictionAudti:PredictionAudit ){
        this.predictionId = PredictionAudti.predictionId;
        this.userId = PredictionAudti.userId;
        this.action = PredictionAudti.action;
        this.changes = PredictionAudti.changes;
        this.createdAt = PredictionAudti.createdAt;
    }
}