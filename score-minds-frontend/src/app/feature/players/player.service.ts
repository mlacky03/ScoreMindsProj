import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { environment } from "../../../environment/environment";
import { ErrorService } from "../../core/services/error.service";
import { Injectable } from "@angular/core";
import { catchError } from 'rxjs';
import { PlayerFullDto } from "./data/player-full.dto";


@Injectable({
    providedIn: 'root'
})
export class PlayerService{
    private http=inject(HttpClient);
    private base=environment.apiUrl;
    private errorService=inject(ErrorService);
    
    findByTeam(teamId:number){
        return this.http.get<PlayerFullDto[]>(`${this.base}/players/team/${teamId}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    findOne(id:number){
        return this.http.get<PlayerFullDto>(`${this.base}/players/${id}`).pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }
}