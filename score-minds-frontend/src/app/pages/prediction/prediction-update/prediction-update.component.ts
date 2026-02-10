import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { PersonalPredictionService } from "../../../feature/predictions/personal-predictions/personal-predictions.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BaseUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/base-p-prediction.dto";
import { FullUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/full-p-prediction.dto";
import { UpdateUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/update-p-prediction";
import { PredictionEventUpdateDto } from "../../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-update.dto";
import { PlayerFullDto } from "../../../feature/players/data/player-full.dto";
import { MatchFullDto } from "../../../feature/match/data/match-full.dto";


type DialogData = { prediction: FullUserPredictionDto, match: MatchFullDto, players: PlayerFullDto[] };
@Component({
  selector: 'app-prediction-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prediction-update.component.html',
  styleUrl: './prediction-update.component.scss'
})
export class PredictionUpdateComponent {
  private fb = inject(FormBuilder);
  private predictionService = inject(PersonalPredictionService);
  private dialogRef = inject(MatDialogRef<PredictionUpdateComponent, 'updated' | 'cancel'>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);

  allPlayers=this.data.players;
  filteredPlayers: PlayerFullDto[] = [];
  playerSearchControl = new FormControl('');
  isSearchFocused = false;

  prediction = this.data.prediction;
  match=this.data.match;
  editingStates: boolean[] = [];
  loading = false;
  isEventsOpen = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    predictedAwayScore: [this.prediction.predictedAwayScore ?? '-'],
    predictedHomeScore: [this.prediction.predictedHomeScore ?? '-'],
    predictedWinner: [this.prediction.winner ?? '', [Validators.required]],
    events: this.fb.array([])
  });
  ngOnInit() {
    if (this.prediction.predictedEvents) {
      this.prediction.predictedEvents.forEach(event => {
        this.addEventToForm(event);
      });
    }

    this.playerSearchControl.valueChanges.subscribe(value => {
      this.filterPlayers(value);
    });
  }
  filterPlayers(searchTerm: string | null) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredPlayers = [];
      return;
    }
    
    const term = searchTerm.toLowerCase();
    
    this.filteredPlayers = this.allPlayers.filter(player => 
      player.name.toLowerCase().includes(term)
    );
  }

  toggleEventsSection() {
    this.isEventsOpen = !this.isEventsOpen;
  }
  addEventToForm(event: PredictionEventUpdateDto) {
    const eventGroup = this.fb.group({
      playerId: [event.playerId, Validators.required],
      type: [event.type, Validators.required], 
      minute: [event.minute || null],
      id: [event.id] 
    });

    this.eventsArray.push(eventGroup);
    this.editingStates.push(false); 
  }
  getPlayerName(playerId: number): string | undefined {
    const player = this.allPlayers.find(p => p.id === playerId);
    return player?.name;
  }
  getPlayerPhoto(playerId: number): string | undefined {
    const player = this.allPlayers.find(p => p.id === playerId);
    return player?.photo;
  }

  addEventForPlayer(player: PlayerFullDto) {
    const eventGroup = this.fb.group({
      playerId: [player.id], 
      type: ['INVALID'],
      minute: [null],
    });

    this.eventsArray.insert(0, eventGroup);
    this.editingStates.unshift(true);

    this.clearSearch();
  }

  clearSearch() {
    this.playerSearchControl.setValue('');
    this.filteredPlayers = [];
    this.isSearchFocused = false;
  }

  onSearchBlur() {
    setTimeout(() => {
      this.isSearchFocused = false;
    }, 200);
  }
  editingStatesChack()
  {
    return this.editingStates.some(state => state);
  }

  onCancel() {
    this.dialogRef.close('cancel');
  }
  get eventsArray() {
    return this.form.get('events') as FormArray;
  }

  onSubmit() {
    if (this.loading || !this.prediction) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    const formValue = this.form.getRawValue();
    const eventsP: PredictionEventUpdateDto[] = this.isEventsEqual(this.prediction.predictedEvents, formValue.events as unknown as PredictionEventUpdateDto[]);
    const p: UpdateUserPredictionDto = {
      matchId: this.prediction.matchId,
      predictedAwayScore: (formValue.predictedAwayScore === '-' || formValue.predictedAwayScore === ' ') ? undefined : Number(formValue.predictedAwayScore),
      predictedHomeScore: (formValue.predictedHomeScore === '-' || formValue.predictedHomeScore === ' ') ? undefined : Number(formValue.predictedHomeScore),
      winner: formValue.predictedWinner!,
      events: eventsP,
    };
    this.predictionService.updatePrediction(this.prediction.id, p).subscribe({
      next: (prediction) => {
        this.dialogRef.close(prediction);
      },
      error: (err) => {
        this.error =
          err?.friendlyMessage ||
          (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
          'An error occurred while updating the group';
        this.loading = false;
      },
    });
  }

  toggleEdit(index: number) {
    this.editingStates[index] = !this.editingStates[index];
  }

  removeEvent(index: number) {
    this.eventsArray.removeAt(index);
    this.editingStates.splice(index, 1);
  }

  isEventsEqual(originalEvents: PredictionEventUpdateDto[], formEvents: PredictionEventUpdateDto[]): PredictionEventUpdateDto[] {

    return formEvents.filter((current, index) => {
        const original = originalEvents[index];

        if (!original) return true;


        const isDifferent = 
            original.playerId != current.playerId ||
            original.type != current.type ||
            original.minute != current.minute; 

        return isDifferent;
    });
  }

}
