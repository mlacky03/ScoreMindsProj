import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environment/environment";
import { ErrorService } from "../../../core/services/error.service";
import { catchError, Subject } from 'rxjs';
import { BaseUserPredictionDto } from "./data/base-p-prediction.dto";
import { CreateUserPredictionDto } from "./data/create-p-prediction.dto";
import { UpdateUserPredictionDto } from "./data/update-p-prediction";
import { FullUserPredictionDto } from "./data/full-p-prediction.dto";

@Injectable({
    providedIn: 'root'
})
export class PersonalPredictionService {

    private http = inject(HttpClient);
    private base = environment.apiUrl;
    private errorService = inject(ErrorService);

    private predictionUpdatedSource = new Subject<FullUserPredictionDto>();
    private predictionDeletedSource = new Subject<number>();


    predictionUpdated$ = this.predictionUpdatedSource.asObservable();
    predictionDeleted$ = this.predictionDeletedSource.asObservable();
    notifyPredictionUpdate(prediction: FullUserPredictionDto) {
        this.predictionUpdatedSource.next(prediction);
    }
    notifyPredictionDelete(predictionId: number) {
        this.predictionDeletedSource.next(predictionId);
    }

    getAllPredictions(page:number,totalSize:number,mode:string) {
        let params = new HttpParams().set('page', page).set('size', totalSize).set('mode', mode);
        return this.http.get<BaseUserPredictionDto[]>(`${this.base}/personal-predictions/all`, { params }).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }


    getOnePrediction(predictionId: number,) {
        return this.http.get<FullUserPredictionDto>(`${this.base}/personal-predictions/find/${predictionId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    createPrediction(dto: CreateUserPredictionDto) {
        return this.http.post<CreateUserPredictionDto>(`${this.base}/personal-predictions/create`, dto).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    updatePrediction(predictionId: number, dto: UpdateUserPredictionDto) {
        return this.http.put<UpdateUserPredictionDto>(`${this.base}/personal-predictions/update/${predictionId}`, dto).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    deletePrediction(predictionId: number) {
        return this.http.delete<{ message: string }>(`${this.base}/personal-predictions/delete/${predictionId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
}
