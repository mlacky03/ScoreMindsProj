import { Component, Input } from "@angular/core";
import { UserLeaderboardDto } from "../../feature/users/data/user-leaderboard.dto";
import { NgIf, NgClass, DatePipe} from "@angular/common";
import { GroupLeaderboardDto } from "../../feature/groups/data/group-leaderboard.dto";


@Component({
    selector: 'app-rank-card',
    standalone: true,
    imports: [NgIf,NgClass,DatePipe],
    templateUrl: './rank-card.component.html',
    styleUrl: './rank-card.component.scss'
})
export class RankCardComponent {
    @Input({required: true}) item!: UserLeaderboardDto|GroupLeaderboardDto;


    getRankClass(): string {
    if (this.item.rank === 1) return 'rank-gold';
    if (this.item.rank === 2) return 'rank-silver';
    if (this.item.rank === 3) return 'rank-bronze';
    return 'rank-standard'; 
  }

   onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.src = '';
    img.classList.add('img-fallback');
  }
}