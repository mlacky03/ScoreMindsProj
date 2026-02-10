export interface PredictionAuditFullDto{
    predictionId: number;
    userId: number;
    action: string;
    changes: any;
    createdAt: Date;
}