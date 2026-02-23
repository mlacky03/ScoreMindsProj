import { Component, EventEmitter, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgOptimizedImage, NgClass, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  finalize,
  map,
  distinctUntilChanged,
  switchMap,
  filter,
  tap,
} from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatchService } from '../../feature/match/match.service';
import { MatchFullDto } from '../../feature/match/data/match-full.dto';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { PlayerService } from '../../feature/players/player.service';
import { PlayerListComponent } from '../player-list/player-list.component';
import { FormsModule } from '@angular/forms';
import { PersonalPredictionService } from '../../feature/predictions/personal-predictions/personal-predictions.service';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';
import { CreateUserPredictionDto } from '../../feature/predictions/personal-predictions/data/create-p-prediction.dto';
import { SocketService } from '../../core/services/socket.service';
import { GroupPredictionService } from '../../feature/predictions/group-predictions/group-prediction.service';
import { CreateGroupPredictionDto } from '../../feature/predictions/group-predictions/data/create-g-predicton.dto';
import { GroupSearchComponent } from '../group-search/group-search.component';

@Component({
  selector: 'app-match-view',
  standalone: true,
  imports: [NgIf, NgFor, NgOptimizedImage, MatDialogModule, PlayerListComponent, CommonModule, FormsModule],
  templateUrl: './match-view.component.html',
  styleUrl: './match-view.component.scss',
})
export class MatchViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private matches = inject(MatchService);
  private dialog = inject(MatDialog);
  private players = inject(PlayerService)
  private personalPredictions = inject(PersonalPredictionService)
  private groupPredictions = inject(GroupPredictionService)
  private socketService = inject(SocketService);

  private socketSub?: Subscription;
  private currentMatchId?: number;
  private groupId?: number

  predictionEvents = signal<PredictionEventCreateDto[]>([]);
  match = signal<MatchFullDto | null>(null);
  homeTeamPlayers = signal<PlayerFullDto[]>([]);
  awayTeamPlayers = signal<PlayerFullDto[]>([]);
  loading = signal(false);
  predictionHomeScore = signal<number | null>(null);
  predictionAwayScore = signal<number | null>(null);
  selectedWinner = signal<'HOME' | 'AWAY' | 'DRAW' | null>(null);
  hasPersonalPrediction =signal<boolean>(false);
  
  selectWinner(side: 'HOME' | 'AWAY' | 'DRAW') {

    if (this.selectedWinner() === side) {
      this.selectedWinner.set(null);
    } else {
      this.selectedWinner.set(side);
    }
  }
  @Output() createPrediction = new EventEmitter<number>();

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id') ?? pm.get('matchId')),
        map((id) => (id ? Number(id) : NaN)),
        filter((id) => Number.isFinite(id) && id > 0),
        distinctUntilChanged(),
        tap((id) => {
          this.loading.set(true);

          this.currentMatchId = id;
          this.socketService.joinRoom(`match_${id}`);
        }),
        switchMap((id) => {

          return this.matches.getOneMatch(id).pipe(
            switchMap((match) => {

              return forkJoin({
                matchData: of(match),
                homePlayers: this.players.findByTeam(match.hometeamId),
                awayPlayers: this.players.findByTeam(match.awayteamId),
              });
            }),
            finalize(() => this.loading.set(false))
          );
        })
      )
      .subscribe({
        next: (result) => {
          this.match.set(result.matchData);
          this.homeTeamPlayers.set(result.homePlayers);
          this.awayTeamPlayers.set(result.awayPlayers);
          console.log("Home players", this.homeTeamPlayers().length);
          console.log("Away players", this.awayTeamPlayers().length);
        },
        error: (err) => {
          console.error('Greška pri učitavanju:', err);
          this.loading.set(false);
        },
      });
    this.socketSub = this.socketService.onMatchUpdate().subscribe((updateData) => {
      console.log('Stigli live podaci:', updateData);

      this.match.update((currentMatch) => {
        if (!currentMatch) return null;
        return { ...currentMatch, ...updateData };
      });
    });


  }
  ngOnDestroy() {
    if (this.currentMatchId) {
      this.socketService.leaveRoom(`match_${this.currentMatchId}`);
    }
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  onImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/avatar-placeholder.webp';
  }
  onMemberImgError(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/avatar-placeholder.webp';
  }
  handlePlayerEvent(event: PredictionEventCreateDto) {
    console.log('Novi događaj:', event);

    this.predictionEvents.update(events => [...events, event]);
    console.log("Dogadjaji", this.predictionEvents());
  }

  removeEvent(index: number) {
    this.predictionEvents.update(events => events.filter((_, i) => i !== index));
  }
  onCreatePrediction() {
    const prediction: CreateUserPredictionDto = {
      matchId: this.match()!.id,
      predictedHomeScore: this.predictionHomeScore() || null,
      predictedAwayScore: this.predictionAwayScore() || null,
      winner: this.selectedWinner() || "DRAW",
      events: this.predictionEvents()
    };

    this.personalPredictions.createPrediction(prediction).subscribe({
      next: (prediction) => {
        console.log('Prediction created:', prediction);
        this.hasPersonalPrediction.set(true);

      },
      error: (err) => {
        console.error('Greška pri kreiranju predikcije:', err);
        if (err.status === 409 || err?.error?.statusCode === 409) {
          this.hasPersonalPrediction.set(true);
        }
      }
    });

  }
  onCreateGroupPrediction() {
    
    this.onOpenSearchDialog().subscribe((selectedGroupId:number|undefined) => {
        
       
        if (selectedGroupId==undefined) {
            return; 
        }

        
        const prediction: CreateGroupPredictionDto = {
            matchId: this.match()!.id,
            predictedHomeScore: this.predictionHomeScore() || null,
            predictedAwayScore: this.predictionAwayScore() || null,
            winner: this.selectedWinner() || "DRAW",
            events: this.predictionEvents()
        };

        this.groupPredictions.createPredicton(prediction, selectedGroupId).subscribe({
            next: (prediction) => {
                console.log('Prediction created:', prediction);
                
            },
            error: (err) => {
                console.error('Greška pri kreiranju predikcije:', err);
                
            }
        });
    });
}
  onOpenSearchDialog() :Observable<number|undefined> {
    const ref = this.dialog.open(GroupSearchComponent, {
      disableClose: false,
      width: '720px',
      panelClass: 'app-modal-panel',
      backdropClass: 'app-modal-backdrop',
    });

    return ref.afterClosed().pipe(
      map((result) => {
        if (result && result !== 'cancel') {
          this.groupId = result as number; 
          return result as number;         
        }
        
        return undefined; 
      })
    );
   
  }



  get homePlayersCount(): number {
    return this.homeTeamPlayers().length;
  }

  get awayPlayersCount(): number {
    return this.awayTeamPlayers().length;
  }




}