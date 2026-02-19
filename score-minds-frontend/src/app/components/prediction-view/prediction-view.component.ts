import { Component, EventEmitter, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgOptimizedImage, NgClass, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  finalize,
  map,
  distinctUntilChanged,
  switchMap,
  filter,
  tap,
} from 'rxjs/operators';
import { PersonalPredictionService } from '../../feature/predictions/personal-predictions/personal-predictions.service';
import { MatDialog } from '@angular/material/dialog';
import { FullUserPredictionDto } from '../../feature/predictions/personal-predictions/models/full-p-prediction.dto';
import { MatchFullDto } from '../../feature/match/data/match-full.dto';
import { MatchService } from '../../feature/match/match.service';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { forkJoin, of, Subscription } from 'rxjs';
import { PlayerService } from '../../feature/players/player.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PredictionUpdateComponent } from '../../pages/prediction/prediction-update/prediction-update.component';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-prediction-view',
  standalone: true,
  imports: [NgIf, NgFor, MatDialogModule, NgClass, DatePipe],
  templateUrl: './prediction-view.component.html',
  styleUrl: './prediction-view.component.scss',
})
export class PredictionViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private predictions = inject(PersonalPredictionService);
  private matches = inject(MatchService)
  private playersS = inject(PlayerService)
  private dialog = inject(MatDialog);
  private socketService = inject(SocketService);


  players = signal<PlayerFullDto[] | null>(null);
  prediction = signal<FullUserPredictionDto | null>(null);
  match = signal<MatchFullDto | null>(null);
  loading = signal(false);

  private subs = new Subscription();
  private currentPredictionId?: number;
  private currentMatchId?:number;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id') ?? pm.get('predictionId')),
        map((id) => (id ? Number(id) : NaN)),
        filter((id) => Number.isFinite(id) && id > 0),
        distinctUntilChanged(),
        switchMap((id) => {
          this.loading.set(true);
          return this.predictions.getOnePrediction(id).pipe(

            tap((pred) => {
              this.prediction.set(pred);

              this.currentPredictionId = id;
              this.socketService.joinRoom(`prediction_${id}`);

              this.currentMatchId = pred.matchId;
              this.socketService.joinRoom(`match_${pred.matchId}`);
            }),

            switchMap((pred) => {
              return this.matches.getOneMatch(pred.matchId).pipe(

                switchMap((match) => {
                  return forkJoin({
                    match: of(match),
                    homePlayers: this.playersS.findByTeam(match.hometeamId),
                    awayPlayers: this.playersS.findByTeam(match.awayteamId),
                  }).pipe(
                    map((result) => {
                      return {
                        match: result.match,
                        players: [...result.homePlayers, ...result.awayPlayers]
                      };
                    })
                  );
                })
              );
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe({


        next: (g) => {
          this.match.set(g.match);
          this.players.set(g.players)
        },
        error: (err) => {
          
        },
      });

      this.subs.add(
      this.socketService.onPredictionUpdate().subscribe((data: any) => {
        console.log('Stigao update za predikciju:', data);
        if (this.currentPredictionId && data.predictionId === this.currentPredictionId) {
          this.prediction.update((current) => {
            if (!current) return null;
            return {
              ...current,
              totalPoints: data.points, 
              status: data.status 
            };
          });
        }
      })
    );

   
    this.subs.add(
      this.socketService.onMatchUpdate().subscribe((matchData: any) => {
        console.log('Stigao update za meč:', matchData);
        
       
        this.match.update((currentMatch) => {
          if (!currentMatch) return null;
         
          return { ...currentMatch, ...matchData };
        });
      })
    );
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/avatar-placeholder.webp';
  }

  getPlayerPhoto(playerId: number): string | undefined {
    const player = this.players()?.find(p => p.id === playerId);
    return player?.photo;
  }
  getPlayerName(playerId: number): string | undefined {
    const player = this.players()?.find(p => p.id === playerId);
    return player?.name;
  }
  getPlayerPostition(playerId: number): string | undefined {
    const player = this.players()?.find(p => p.id === playerId);
    return player?.position;
  }
  

  onUpdate() {
    const p = this.prediction();
    const m = this.match();
    const pl=this.players();
    if (!p) return;

    const ref = this.dialog.open(PredictionUpdateComponent, {
      data: { prediction: p, match: m, players: pl },
      disableClose: false,
      width: '720px',
      maxHeight: '100vh',
      panelClass: 'app-modal-panel',
      backdropClass: 'app-modal-backdrop',
    });
    ref.afterClosed().subscribe((result) => {
      if (result && typeof result === 'object') {
        this.prediction.set({ ...this.prediction()!, ...result });
        this.predictions.notifyPredictionUpdate(result);
      }
    });
  }

  private refreshCurrent() {
    const g = this.prediction();
    if (!g) return;
    this.loading.set(true);
    this.predictions
      .getOnePrediction(g.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (v) => this.prediction.set(v),
        error: (err) => {
          // Error handling is done by ErrorService
        },
      });
  }

  ngOnDestroy(): void {
      this.subs.unsubscribe();
      if (this.currentPredictionId) {
        this.socketService.leaveRoom(`prediction_${this.currentPredictionId}`);
      }
      if (this.currentMatchId) {
        this.socketService.leaveRoom(`match_${this.currentMatchId}`);
      }
  }
}