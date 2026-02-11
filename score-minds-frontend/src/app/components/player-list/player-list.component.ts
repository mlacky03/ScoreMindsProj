import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { PlayerFullDto } from '../../feature/players/data/player-full.dto';
import { PredictionEventCreateDto } from '../../feature/predictions/personal-predictions/data/prediction-event/prediction-event-create.dto';
import { FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-players-list',
    imports: [PlayerCardComponent, NgFor,NgIf],
    templateUrl: './player-list.component.html',
    styleUrl: './player-list.component.scss',
})
export class PlayerListComponent {
    @Input({ required: true }) players: PlayerFullDto[] = [];

    @Output() playerEvent = new EventEmitter<PredictionEventCreateDto>();

    onEvent(event: PredictionEventCreateDto): void {
        this.playerEvent.emit(event);
        console.log(event);
    }

    trackByPlayer(index: number, player: PlayerFullDto): number {
        return player.externalId;
    }

    
}
