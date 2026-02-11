import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-player-card',
    standalone: true,
    imports: [NgIf, NgClass, FormsModule,ReactiveFormsModule,CommonModule],
    templateUrl: './player-card.component.html',
    styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {
    @Input({ required: true }) player!: PlayerFullDto;
    @Input() currentUserId?: number;

    @Output() eventCreated = new EventEmitter<PredictionEventCreateDto>();

    editingStates: boolean[] = [];
    isEditing = false;
    form!: FormGroup;
    constructor(private fb: FormBuilder) {}
    get playerName(): string {
        return this.player?.name ?? '';
    }

    startEdit(type: 'GOAL' | 'ASSIST') {
        this.isEditing = true;

        // Kreiramo formu lokalno
        this.form = this.fb.group({
            type: [type, Validators.required],
            minute: [null, [Validators.required, Validators.min(1)]]
        });
    }
    toggleEdit(index: number) {
        this.editingStates[index] = !this.editingStates[index];
    }

    cancelEdit() {
    this.isEditing = false;
  }

    get playerPosition(): string {
        return this.player?.position ?? '';
    }

    get playerImage(): string {
        return this.player?.photo ?? '';
    }

    showGoalInput = false;
    showAssistInput = false;


    goalMinute: number | null = null;
    assistMinute: number | null = null;

    save() {
    if (this.form.valid) {
      const payload = {
        playerId: this.player.id,
        ...this.form.value
      };

      this.emitEvent(payload.minute,payload.type);
      
      this.isEditing = false;
      this.cancelEdit();
    }
  }




    private emitEvent(minute: number | null,type: 'GOAL' | 'ASSIST') {
        this.eventCreated.emit({
            playerId: this.player.id,
            type: type,
            minute: minute,
            predictionId: 0
        });

    }

    onImgError(e: Event) {
        const img = e.target as HTMLImageElement;
        img.src = '';
        img.classList.add('img-fallback');
    }
}
