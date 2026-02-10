import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
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
import { forkJoin, of } from 'rxjs';
import { PlayerService } from '../../feature/players/player.service';
import { PlayerListComponent } from '../player-list/player-list.component';
import { FormsModule } from '@angular/forms';
import { PersonalPredictionService } from '../../feature/predictions/personal-predictions/personal-predictions.service';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';
import { CreateUserPredictionDto } from '../../feature/predictions/personal-predictions/data/create-p-prediction.dto';

@Component({
  selector: 'app-match-view',
  standalone: true,
  imports: [NgIf, NgFor, NgOptimizedImage, MatDialogModule, PlayerListComponent, CommonModule, FormsModule],
  templateUrl: './match-view.component.html',
  styleUrl: './match-view.component.scss',
})
export class MatchViewComponent {
  private route = inject(ActivatedRoute);
  private matches = inject(MatchService);
  private dialog = inject(MatDialog);
  private players = inject(PlayerService)
  private predictions = inject(PersonalPredictionService)

  predictionEvents = signal<PredictionEventCreateDto[]>([]);
  match = signal<MatchFullDto | null>(null);
  homeTeamPlayers = signal<PlayerFullDto[]>([]);
  awayTeamPlayers = signal<PlayerFullDto[]>([]);
  loading = signal(false);

  predictionHomeScore = signal<number | null>(null);
  predictionAwayScore = signal<number | null>(null);
  selectedWinner = signal<'HOME' | 'AWAY' | 'DRAW' | null>(null);
  selectWinner(side: 'HOME' | 'AWAY' | 'DRAW') {
    // Ako je već selektovan taj tim, deselekruj ga (opciono)
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
        tap(() => this.loading.set(true)),
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

        },
        error: (err) => {
          console.error('Greška pri učitavanju:', err);
          this.loading.set(false);
        },
      });
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

    this.predictions.createPrediction(prediction).subscribe({
      next: (prediction) => {
        console.log('Prediction created:', prediction);
      },
      error: (err) => {
        console.error('Greška pri kreiranju predikcije:', err);
      }
    });
  }
  

  get homePlayersCount(): number {
    return this.homeTeamPlayers().length;
  }

  get awayPlayersCount(): number {
    return this.awayTeamPlayers().length;
  }




}