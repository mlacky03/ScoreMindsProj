import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';

@Component({
    selector: 'app-players-list',
    imports: [PlayerCardComponent, NgFor],
    templateUrl: './player-list.component.html',
    styleUrl: './player-list.component.scss',
})
export class PlayerListComponent {
    @Input({ required: true }) players: PlayerFullDto[] = [];

    @Output() playerEvent = new EventEmitter<PredictionEventCreateDto>();

    ngOnChanges(): void {
        const map = new Map<string, PlayerFullDto>();
    }

    onEvent(event: PredictionEventCreateDto): void {
        this.playerEvent.emit(event);
    }

    trackByPlayer(index: number, player: PlayerFullDto): number {
        return player.id;
    }
}
