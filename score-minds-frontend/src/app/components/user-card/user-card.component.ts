import { Component, Input } from "@angular/core";
import { UserLeaderboardDto } from "../../feature/users/data/user-leaderboard.dto";
import { NgIf, NgClass, DatePipe} from "@angular/common";
import { GroupLeaderboardDto } from "../../feature/groups/data/group-leaderboard.dto";


@Component({
    selector: 'app-user-card',
    standalone: true,
    imports: [NgIf,NgClass,DatePipe],
    templateUrl: './user-card.component.html',
    styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
    @Input({required: true}) user!: UserLeaderboardDto|GroupLeaderboardDto;


    getRankClass(): string {
    if (this.user.rank === 1) return 'rank-gold';
    if (this.user.rank === 2) return 'rank-silver';
    if (this.user.rank === 3) return 'rank-bronze';
    return 'rank-standard'; 
  }

   onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.src = '';
    img.classList.add('img-fallback');
  }
}