import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { NgClass, NgIf } from '@angular/common';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-player-card',
    standalone: true,
    imports: [NgIf, NgClass, FormsModule],
    templateUrl: './player-card.component.html',
    styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {
    @Input({ required: true }) player!: PlayerFullDto;
    @Input() currentUserId?: number;

    @Output() eventCreated = new EventEmitter<PredictionEventCreateDto>();

    isModalOpen = false;
    activeEventType: 'GOAL' | 'ASSIST' | null = null;
    inputMinute: number | null = null;
    get playerName(): string {
        return this.player?.name ?? '';
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
    openModal(type: 'GOAL' | 'ASSIST') {
        this.activeEventType = type;
        this.inputMinute = null; 
        this.isModalOpen = true; 
    }

   
    confirmWithMinute() {
        if (this.activeEventType) {
            this.emitEvent(this.inputMinute); 
        }
        this.closeModal();
    }

    
    confirmWithoutMinute() {
        if (this.activeEventType) {
            this.emitEvent(null); // Šaljemo null
        }
        this.closeModal();
    }

   
    closeModal() {
        this.isModalOpen = false;
        this.activeEventType = null;
        this.inputMinute = null;
    }

    private emitEvent(minute: number | null) {
        this.eventCreated.emit({
            playerId: this.player.id,
            type: this.activeEventType!,
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
