import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchBaseDto } from '../../feature/match/data/match-base.dto';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [NgIf,NgClass],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
})
export class MatchCardComponent {
  @Input({ required: true }) match!: MatchBaseDto;
  @Input() currentUserId?: number;

  @Output() open = new EventEmitter<number>();

  get homeTeamName(): string {
    return this.match?.homeTeamName ?? '';
  }

  get awayTeamName(): string {
    return this.match?.awayTeamName ?? '';
  }

  handleClick(): void {
  if (this.match?.id != null) {
    this.open.emit(this.match.id);
  }
}

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  onImgError(e:Event)
  {
    const img=e.target as HTMLImageElement;
    img.src='';
    img.classList.add('img-fallback');
  }
}