import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ErrorService } from "../../core/services/error.service";
import { environment } from "../../../environment/environment";
import { inject } from "@angular/core";
import { catchError } from 'rxjs';
import { MatchBaseDto } from "./data/match-base.dto";
import { MatchFullDto } from "./data/match-full.dto";


@Injectable({
    providedIn: 'root'
})
export class MatchService {
    private http = inject(HttpClient);
    private errorService = inject(ErrorService);
    private base = environment.apiUrl;


    getAllMatches() {
        return this.http.get<MatchBaseDto[]>(`${this.base}/matches`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    getOneMatch(mathcId: number) {
        return this.http.get<MatchFullDto>(`${this.base}/matches/${mathcId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );


    }

    getUpcomingMatches() {
        return this.http.get<MatchBaseDto[]>(`${this.base}/matches/upcoming`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
    getLiveMathes() {
        return this.http.get<MatchBaseDto[]>(`${this.base}/matches/live`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    getMatchesByIds(ids: number[]) {
        const idsString = ids.join(',');
        let params = new HttpParams().set('ids', idsString);
        return this.http.get<MatchBaseDto[]>(`${this.base}/matches/ids`, { params }).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
}