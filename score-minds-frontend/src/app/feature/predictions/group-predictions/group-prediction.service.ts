import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environment/environment";
import { ErrorService } from "../../../core/services/error.service";
import { catchError, Subject } from "rxjs";
import { FullGroupPredictionDto } from "./data/full-g-predicton.dto";
import { BaseGroupPredictionDto } from "./data/base-g-predicton.dto";
import { CreateGroupPredictionDto } from "./data/create-g-predicton.dto";
import { UpdateGroupPredictionDto } from "./data/update-g-predicton.dto";

@Injectable({
    providedIn: 'root'
})
export class GroupPredictionService {
    private http = inject(HttpClient);
    private base = environment.apiUrl;
    private errorService = inject(ErrorService);

    private predictionUpdateSource = new Subject<FullGroupPredictionDto>();
    private predictionDeletedSource = new Subject<number>();

    predictionUpdated$ = this.predictionUpdateSource.asObservable();
    predictionDeleted$ = this.predictionDeletedSource.asObservable();

    notifyPredictionUpdate(prediction: FullGroupPredictionDto) {
        this.predictionUpdateSource.next(prediction);
    }
    notifyPredictionDelete(predictionId: number) {
        this.predictionDeletedSource.next(predictionId);
    }

    getAllPrediction(groupId: number) {
        return this.http.get<BaseGroupPredictionDto[]>(`${this.base}/group-predictions/all/${groupId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    getOnePrediction(predictionId: number, groupId: number) {
        return this.http.get<FullGroupPredictionDto>(`${this.base}/group-predictions/${groupId}/${predictionId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    createPredicton(dto: CreateGroupPredictionDto, groupId: number) {
        return this.http.post<CreateGroupPredictionDto>(`${this.base}/group-predictions/create/${groupId}`, dto).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    updatePrediction(predictionId: number, dto: UpdateGroupPredictionDto, groupId: number) {
        return this.http.put<UpdateGroupPredictionDto>(`${this.base}/group-predictions/${groupId}/${predictionId}`, dto).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    deletePrediction(predictionId: number, groupId: number) {
        return this.http.delete<{ message: string }>(`${this.base}/group-predictions/${groupId}/${predictionId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
}
