import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../../environment/environment";
import { ErrorService } from "../../core/services/error.service";
import { PredictionAuditFullDto } from "./data/prediction-audit-full.dto";
import { catchError } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class PredictionAuditService{
    private http=inject(HttpClient);
    private errorService=inject(ErrorService);
    private base=environment.apiUrl;

    GetByPrediciton(predictionId:number){
        return this.http.get<PredictionAuditFullDto[]>(`${this.base}/prediction-audit/${predictionId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
}