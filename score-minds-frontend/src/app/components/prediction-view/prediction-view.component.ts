import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgOptimizedImage, NgClass, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, withComponentInputBinding } from '@angular/router';
import {
  finalize,
  map,
  distinctUntilChanged,
  switchMap,
  filter,
  tap,
  debounceTime,
} from 'rxjs/operators';
import { PersonalPredictionService } from '../../feature/predictions/personal-predictions/personal-predictions.service';
import { MatDialog } from '@angular/material/dialog';
import { FullUserPredictionDto } from '../../feature/predictions/personal-predictions/data/full-p-prediction.dto';
import { MatchFullDto } from '../../feature/match/data/match-full.dto';
import { MatchService } from '../../feature/match/match.service';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { combineLatest, forkJoin, of, Subscription } from 'rxjs';
import { PlayerService } from '../../feature/players/player.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PredictionUpdateComponent } from '../../pages/prediction/prediction-update/prediction-update.component';
import { SocketService } from '../../core/services/socket.service';
import { GroupPredictionService } from '../../feature/predictions/group-predictions/group-prediction.service';
import { FullGroupPredictionDto } from '../../feature/predictions/group-predictions/data/full-g-predicton.dto';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';


@Component({
  selector: 'app-prediction-view',
  standalone: true,
  imports: [NgIf, NgFor, MatDialogModule, NgClass, DatePipe],
  templateUrl: './prediction-view.component.html',
  styleUrl: './prediction-view.component.scss',
})
export class PredictionViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private personalPredictions = inject(PersonalPredictionService);
  private groupPredictions = inject(GroupPredictionService)
  private matches = inject(MatchService)
  private playersS = inject(PlayerService)
  private dialog = inject(MatDialog);
  private socketService = inject(SocketService);
  private router = inject(Router);

  mode: 'personal' | 'group' = 'personal';

  private activePredictionService(pId: number, gId: number): any {
    return this.mode === 'personal'
      ? this.personalPredictions.getOnePrediction(pId)
      : this.groupPredictions.getOnePrediction(pId, gId);
  }

  players = signal<PlayerFullDto[] | null>(null);
  prediction = signal<FullUserPredictionDto | FullGroupPredictionDto | null>(null);
  match = signal<MatchFullDto | null>(null);
  loading = signal(false);

  private subs = new Subscription();
  private currentPredictionId?: number;
  private currentMatchId?: number;
  private currentGroupId?: number;

  isLockedByOther = signal<boolean>(false);
  activeEditorName = signal<string | null>(null);

  ngOnInit() {
    this.mode = this.route.snapshot.data['mode'] || 'personal';
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ])
      .pipe(
        map(([pm, qp]) => {
          const pIdStr = pm.get('id') ?? pm.get('predictionId');
          const gIdStr = qp.get('groupId');

          return {
            pId: pIdStr ? Number(pIdStr) : NaN,
            gId: gIdStr ? Number(gIdStr) : NaN
          };
        }),

        filter((params) => Number.isFinite(params.pId) && params.pId > 0),
        distinctUntilChanged((prev, curr) => prev.pId === curr.pId && prev.gId === curr.gId),


        switchMap(({ pId, gId }) => {
          this.loading.set(true);


          return this.activePredictionService(pId, gId).pipe(
            tap((pred: any) => {
              this.prediction.set(pred);

              if (this.mode === 'group') {
                this.currentGroupId = gId;
                this.listenForLiveUpdates();

              }

              this.currentPredictionId = pId;
              this.socketService.joinRoom(`prediction_${pId}`);

              this.currentMatchId = pred.matchId;
              this.socketService.joinRoom(`match_${pred.matchId}`);
            }),

            switchMap((pred: FullUserPredictionDto | FullGroupPredictionDto) => {
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


        next: (g: any) => {
          this.match.set(g.match);
          this.players.set(g.players)
        },
        error: (err) => {
          console.error(err);
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

  private listenForLiveUpdates() {

    this.subs.add(
      this.socketService.on('edit_lock_status').subscribe((status: any) => {
        if (status.locked && !status.isMe) {
          this.isLockedByOther.set(true);
          this.activeEditorName.set(status.editorName || 'Neko drugi');
        } else {

          this.isLockedByOther.set(false);
          this.activeEditorName.set(null);
        }
      })
    );


    this.subs.add(
      this.socketService.on('live_form_update').subscribe((newData: any) => {

        this.prediction.update((current) => {
          if (!current) return null;
          return { ...current, ...newData, predictedEvents: newData.events, winner: newData.predictedWinner };
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

  getMode(): 'personal' | 'group' {
    return this.mode;
  }

  getOwnerName(): string | null {
    return this.prediction()?.createdByName || null;
  }


  onUpdate() {
    const p = this.prediction();
    const m = this.match();
    const pl = this.players();
    if (!p) return;
    console.log(this.currentGroupId);
    const ref = this.dialog.open(PredictionUpdateComponent, {
      data: { prediction: p, match: m, players: pl, mode: this.mode, groupId: this.currentGroupId },
      disableClose: false,
      width: '720px',
      maxHeight: '100vh',
      panelClass: 'app-modal-panel',
      backdropClass: 'app-modal-backdrop',
    });
    ref.afterClosed().subscribe((result) => {
      if (result && typeof result === 'object') {
        this.prediction.set({ ...this.prediction()!, ...result });
        this.mode === 'personal' ? this.personalPredictions.notifyPredictionUpdate(result) : this.groupPredictions.notifyPredictionUpdate(result);
      }
    });
  }

  onDelete() {
    const p = this.prediction();
    if (!p) return;
    const ref = this.dialog.open(DeleteConfirmationDialogComponent, {
      disableClose: false,
      width: '420px',
      maxWidth: '90vw',
      panelClass: 'logout-dialog-panel',
      backdropClass: 'app-modal-backdrop',
      hasBackdrop: true,
      autoFocus: true,
      restoreFocus: true
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        if (this.mode === 'personal') {
          this.personalPredictions.deletePrediction(p.id).subscribe({
            next: () => {
              console.log('Obrisano personalno!')
              this.personalPredictions.notifyPredictionDelete(p.id);
              this.router.navigate(['/predictions']);
            },
            error: (err) => console.error(err)
          });
        } else {
          this.groupPredictions.deletePrediction(p.id, this.currentGroupId!).subscribe({
            next: () => {
              console.log('Obrisano grupno!')
              this.groupPredictions.notifyPredictionDelete(p.id);
              this.router.navigate(['/groupPredictions'],
                {
                  state: { passedGroupId: this.currentGroupId }
                });
            },
            error: (err) => console.error(err)
          });
        }
      }

    });


  }

  private refreshCurrent() {
    const g = this.prediction();
    if (!g) return;
    this.loading.set(true);
    this.personalPredictions
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
      //this.socketService.emit('release_edit_lock', { predictionId: this.currentPredictionId });
      this.socketService.leaveRoom(`prediction_${this.currentPredictionId}`);
      this.socketService.leaveRoom(`match_${this.currentMatchId}`);
    }
  }
}