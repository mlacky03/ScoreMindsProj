import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { PersonalPredictionService } from "../../../feature/predictions/personal-predictions/personal-predictions.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FullUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/full-p-prediction.dto";
import { UpdateUserPredictionDto } from "../../../feature/predictions/personal-predictions/data/update-p-prediction";
import { PredictionEventUpdateDto } from "../../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-update.dto";
import { PlayerFullDto } from "../../../feature/players/data/player-full.dto";
import { MatchFullDto } from "../../../feature/match/data/match-full.dto";
import { FullGroupPredictionDto } from "../../../feature/predictions/group-predictions/data/full-g-predicton.dto";
import { UpdateGroupPredictionDto } from "../../../feature/predictions/group-predictions/data/update-g-predicton.dto";
import { GroupPredictionService } from "../../../feature/predictions/group-predictions/group-prediction.service";
import { SocketService } from "../../../core/services/socket.service";
import { debounceTime, Subscription } from "rxjs";


type DialogData = { prediction: FullGroupPredictionDto | FullUserPredictionDto, match: MatchFullDto, players: PlayerFullDto[], mode: 'personal' | 'group', groupId?: number };
@Component({
  selector: 'app-prediction-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prediction-update.component.html',
  styleUrl: './prediction-update.component.scss'
})
export class PredictionUpdateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private predictionService = inject(PersonalPredictionService);
  private groupService = inject(GroupPredictionService);
  private dialogRef = inject(MatDialogRef<PredictionUpdateComponent, 'updated' | 'cancel'>);
  private data = inject<DialogData>(MAT_DIALOG_DATA);
  private socketService = inject(SocketService);

  private subs = new Subscription();
  allPlayers = this.data.players;
  filteredPlayers: PlayerFullDto[] = [];
  playerSearchControl = new FormControl('');
  isSearchFocused = false;

  mode = this.data.mode;
  prediction = this.data.prediction;
  match = this.data.match;
  editingStates: boolean[] = [];
  loading = false;
  isEventsOpen = false;
  error: string | null = null;
  group = this.data.groupId;

  hasLock = false;
  isSaved = false;
  form = this.fb.nonNullable.group({
    predictedAwayScore: [this.prediction.predictedAwayScore ?? '-'],
    predictedHomeScore: [this.prediction.predictedHomeScore ?? '-'],
    predictedWinner: [this.prediction.winner ?? '', [Validators.required]],
    events: this.fb.array([])
  });

  private activePredictionService(p: UpdateGroupPredictionDto | UpdateUserPredictionDto): any {
    console.log(this.group);
    return this.mode === 'personal'
      ? this.predictionService.updatePrediction(this.prediction.id, p)
      : this.groupService.updatePrediction(this.prediction.id, p, this.group!);
  }
  ngOnInit() {
    if (this.data.mode === 'group') {

      this.form.disable({ emitEvent: false });
      this.playerSearchControl.disable({ emitEvent: false });
      this.socketService.emit('request_edit_lock', {
        predictionId: this.data.prediction.id
      });

      this.subs.add(
        this.socketService.on('edit_lock_status').subscribe((status: any) => {
          if (status.isMe) {
            this.hasLock = true;
            this.form.enable({ emitEvent: false });
            this.playerSearchControl.enable({ emitEvent: false });
          } else {
            this.hasLock = false;
            this.form.disable({ emitEvent: false });
            this.playerSearchControl.enable({ emitEvent: false });
          }
        })
      );

      this.subs.add(
        this.socketService.on('live_form_update').subscribe((newData: any) => {
          this.form.patchValue(newData, { emitEvent: false });

          if (newData.events && Array.isArray(newData.events)) {
            this.syncEventsArray(newData.events);
          }
          this.form.patchValue(newData, { emitEvent: false });
        })
      );

      this.subs.add(
        this.form.valueChanges.pipe(
          debounceTime(300)
        ).subscribe(val => {
          this.socketService.emit('form_value_changed', {
            predictionId: this.data.prediction.id,
            data: val
          });
        })
      );
    }
    else {
      this.hasLock = true;
    }

    if (this.prediction.predictedEvents) {
      this.prediction.predictedEvents.forEach(event => {
        this.addEventToForm(event);
      });
    }

    this.playerSearchControl.valueChanges.subscribe(value => {
      this.filterPlayers(value);
    });

  }
  private syncEventsArray(incomingEvents: any[]) {
    const currentLength = this.eventsArray.length;
    const incomingLength = incomingEvents.length;


    if (currentLength < incomingLength) {
      for (let i = currentLength; i < incomingLength; i++) {
        this.eventsArray.push(this.fb.group({
          playerId: [incomingEvents[i].playerId, Validators.required],
          type: [incomingEvents[i].type, Validators.required],
          minute: [incomingEvents[i].minute || null],
          id: [incomingEvents[i].id || null]
        }), { emitEvent: false });
        this.editingStates.push(false);
      }
    }

    else if (currentLength > incomingLength) {
      for (let i = currentLength - 1; i >= incomingLength; i--) {
        this.eventsArray.removeAt(i, { emitEvent: false });
        this.editingStates.splice(i, 1);
      }
    }


    this.eventsArray.patchValue(incomingEvents, { emitEvent: false });
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
  editingStatesChack() {
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
    //const eventsP: PredictionEventUpdateDto[] = this.isEventsEqual(this.prediction.predictedEvents, formValue.events as unknown as PredictionEventUpdateDto[]);
    const p = this.updateMode();
    p.predictedAwayScore = formValue.predictedAwayScore !== null &&
      formValue.predictedAwayScore !== undefined &&
      formValue.predictedAwayScore !== ''
      ? Number(formValue.predictedAwayScore) : undefined;

    p.predictedHomeScore = formValue.predictedHomeScore !== null &&
      formValue.predictedHomeScore !== undefined &&
      formValue.predictedHomeScore !== ''
      ? Number(formValue.predictedHomeScore) : undefined;
    p.winner = formValue.predictedWinner!;
    p.events = formValue.events as unknown as PredictionEventUpdateDto[];
    
    this.activePredictionService(p).subscribe({
      next: (prediction: any) => {
        this.isSaved = true;
        this.dialogRef.close(prediction);
      },
      error: (err: any) => {
        this.error =
          err?.friendlyMessage ||
          (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
          'An error occurred while updating the group';
        this.loading = false;
      },
    });
  }
  private updateMode(): UpdateUserPredictionDto | UpdateGroupPredictionDto {

    return this.mode === 'personal' ? { matchId: this.prediction.matchId } as UpdateUserPredictionDto : { matchId: this.prediction.matchId } as UpdateGroupPredictionDto;
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

  ngOnDestroy() {
    if (this.data.mode === 'group') {
      if (this.hasLock && !this.isSaved) {
        this.restoreOriginalState();
      }
      this.socketService.emit('release_edit_lock', {
        predictionId: this.data.prediction.id
      });
    }
    this.subs.unsubscribe();
  }

  private restoreOriginalState() {

    this.form.patchValue({
      predictedAwayScore: this.prediction.predictedAwayScore ?? '-',
      predictedHomeScore: this.prediction.predictedHomeScore ?? '-',
      predictedWinner: this.prediction.winner ?? ''
    }, { emitEvent: false });


    this.eventsArray.clear({ emitEvent: false });
    this.editingStates = [];

    if (this.prediction.predictedEvents) {
      this.prediction.predictedEvents.forEach(event => {
        this.eventsArray.push(this.fb.group({
          playerId: [event.playerId, Validators.required],
          type: [event.type, Validators.required],
          minute: [event.minute || null],
          id: [event.id]
        }), { emitEvent: false });
        this.editingStates.push(false);
      });
    }


    this.socketService.emit('form_value_changed', {
      predictionId: this.data.prediction.id,
      data: this.form.getRawValue()
    });
  }

}
