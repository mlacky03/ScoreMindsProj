import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchCardComponent } from '../match-card/match-card.components';
import { MatchBaseDto } from '../../feature/match/data/match-base.dto';

@Component({
    selector: 'app-match-list',
    imports: [NgFor, NgIf,MatchCardComponent],
    templateUrl: './match-list.component.html',
    styleUrl: './match-list.component.scss',
})
export class MatchListComponent {
    @Input({required:true}) matches: MatchBaseDto[] = [];

    @Output() matchSelected = new EventEmitter<number>();
    
    ngOnChanges():void{
        const map=new Map<string,MatchBaseDto>();
    }

    onOpen(matchId:number):void{
        this.matchSelected.emit(matchId);
    }
}
