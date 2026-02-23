export interface PredictionAuditFullDto{
    id: number;
    predictionId: number;
    userId: number;
    action: string;
    changes: any;
    createdAt: Date;
}