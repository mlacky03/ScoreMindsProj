import { Component, Input } from "@angular/core";
import { UserBaseDto } from "../../feature/users/data/user-base.dto";
import { UserLeaderboardDto } from "../../feature/users/data/user-leaderboard.dto";
import { NgIf, NgClass, DatePipe, NgFor } from "@angular/common";
import { RankCardComponent } from "../rank-card/rank-card.component";
import { GroupLeaderboardDto } from "../../feature/groups/data/group-leaderboard.dto";


@Component({
    selector: 'app-rank-list',
    standalone: true,
    imports: [NgIf,DatePipe,RankCardComponent,NgFor],
    templateUrl: './rank-list.component.html',
    styleUrl: './rank-list.component.scss'
})
export class RankListComponent {
    @Input({required: true}) users!: (UserLeaderboardDto | GroupLeaderboardDto)[];
    
}