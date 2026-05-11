import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, WritableSignal, inject, signal } from '@angular/core';
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
import { combineLatest, forkJoin, of, Subscription, interval, EMPTY, Observable } from 'rxjs';
import { PlayerService } from '../../feature/players/player.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PredictionUpdateComponent } from '../../pages/prediction/prediction-update/prediction-update.component';
import { SocketService } from '../../core/services/socket.service';
import { GroupPredictionService } from '../../feature/predictions/group-predictions/group-prediction.service';
import { FullGroupPredictionDto } from '../../feature/predictions/group-predictions/data/full-g-predicton.dto';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { AuthService } from '../../core/auth/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { toObservable } from '@angular/core/rxjs-interop';
import { GameDto } from '../../feature/match/data/game.dto';
import { ComputedMessage } from '../../feature/socket-message/computed.message';
import { LockStatusMessage } from '../../feature/socket-message/lock-status.message';
import { DeletedPredictionMessage } from '../../feature/socket-message/deleted-prediction.message';


@Component({
  selector: 'app-prediction-view',
  standalone: true,
  imports: [NgIf, NgFor, MatDialogModule, NgClass, DatePipe, MatSnackBarModule],
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
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private isDeleting = false;

  mode: 'personal' | 'group' = 'personal';
  private activePredictionService(pId: number, gId: number): Observable<FullUserPredictionDto | FullGroupPredictionDto> {
    return this.mode === 'personal'
      ? this.personalPredictions.getOnePrediction(pId)
      : this.groupPredictions.getOnePrediction(pId, gId);
  }

  players = signal<PlayerFullDto[] | null>(null);
  prediction = signal<FullUserPredictionDto | FullGroupPredictionDto | null>(null);
  match = signal<MatchFullDto | null>(null);
  loading = signal(false);
  private match$ = toObservable(this.match);

  showLiveResult = signal<boolean>(true);

  private subs = new Subscription();
  private currentPredictionId?: number;
  private currentMatchId?: number;
  private currentGroupId?: number;
  currentUser = this.authService.currentUser;
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
            tap((pred: FullUserPredictionDto | FullGroupPredictionDto) => {
              if (this.currentPredictionId && this.currentPredictionId !== pId && this.prediction()?.status !== 'PROCESSED') {
                this.socketService.leaveRoom(`prediction_${this.currentPredictionId}`);
              }
              this.prediction.set(pred);

              // this.isLockedByOther.set(false);
              // this.activeEditorName.set(null);


              if (this.mode === 'group') {
                this.currentGroupId = gId;

              }

              this.subs.add(
                this.match$.pipe(

                  map(m => m?.status),

                  distinctUntilChanged(),

                  switchMap(status => {
                    if (status === 'LIVE') {

                      return interval(6000);
                    } else {

                      this.showLiveResult.set(false);
                      return EMPTY;
                    }
                  })
                ).subscribe(() => {

                  this.showLiveResult.update(trenutno => !trenutno);
                })
              );

              this.currentPredictionId = pId;
              if (pred.status !== 'PROCESSED') {
                this.socketService.joinRoom(`prediction_${pId}`);
              }

              this.currentMatchId = pred.matchId;
            }),

            switchMap((pred: FullUserPredictionDto | FullGroupPredictionDto) => {
              return this.matches.getOneMatch(pred.matchId).pipe(

                switchMap((match:MatchFullDto) => {
                  return forkJoin({
                    match: of(match),
                    homePlayers: this.playersS.findByTeam(match.hometeamId),
                    awayPlayers: this.playersS.findByTeam(match.awayteamId),
                  }).pipe(
                    map((result): GameDto => ({
                      match: result.match,
                      players: [...result.homePlayers, ...result.awayPlayers]
                    }))
                  );
                })
              );
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe({


        next: (g: GameDto) => {
          this.match.set(g.match);
          this.players.set(g.players)
        },
        error: (err) => {
          console.error(err);
        },
      });

    this.subs.add(
      this.socketService.onPredictionUpdate().subscribe((data: ComputedMessage) => {
        if (this.isDeleting) return;
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
      this.socketService.onMatchUpdate().subscribe((matchData: Partial<MatchFullDto>) => {
        console.log('Stigao update za meč:', matchData);


        this.match.update((currentMatch) => {
          if (!currentMatch) return null;

          return { ...currentMatch, ...matchData };
        });
      })
    );

    if (this.mode === 'group') {
      this.listenForLiveUpdates();
    }
  }

  private listenForLiveUpdates() {

    this.subs.add(
      this.socketService.on('edit_lock_status').subscribe((status: Partial<LockStatusMessage>) => {
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
      this.socketService.onGroupPredictionDelete().subscribe((data: DeletedPredictionMessage) => {
        console.log('Stigao update za brisanje predikcije:', data);
        if (this.currentPredictionId && Number(data.predictionId) === Number(this.currentPredictionId)) {
          this.prediction.set(null);
          this.snackBar.open('Ova predikcija je upravo obrisana.', 'Zatvori', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-info']
          });
          this.groupPredictions.notifyPredictionDelete(this.currentPredictionId);
          this.router.navigate(['/groupPredictions']);
        }
      })
    )
    this.subs.add(
      this.socketService.on('live_form_update').subscribe((newData: any) => {
        const currentPred = this.prediction();
        if (!currentPred) return;
        const updatedPrediction = {
          ...currentPred,
          ...newData,
          predictedEvents: newData.events,
          winner: newData.predictedWinner
        };
        this.prediction.set(updatedPrediction);
        this.mode === 'personal' ? this.personalPredictions.notifyPredictionUpdate(updatedPrediction) : this.groupPredictions.notifyPredictionUpdate(updatedPrediction);
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

  getUsername(): string {
    return this.currentUser()?.username || '';
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
  toggleResultView() {
    const currentMatch = this.match();
    if (currentMatch && currentMatch.status === 'FT') {
      this.showLiveResult.update(trenutno => !trenutno);
    }
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
        this.isDeleting = true;
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.currentPredictionId) {
      this.socketService.leaveRoom(`prediction_${this.currentPredictionId}`);
    }
  }
}
