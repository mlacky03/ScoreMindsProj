import { PredictionAudit } from "src/domain/models/prediction-audit.model";

export class FullPredictionAuditDto {
    id:number
    predictionId: number;
    userId: number;
    action: string;
    changes: any;
    createdAt: Date;
    constructor(PredictionAudti:PredictionAudit ){
        this.id = PredictionAudti.id!;
        this.predictionId = PredictionAudti.predictionId;
        this.userId = PredictionAudti.userId;
        this.action = PredictionAudti.action;
        this.changes = PredictionAudti.changes;
        this.createdAt = PredictionAudti.createdAt;
    }
}