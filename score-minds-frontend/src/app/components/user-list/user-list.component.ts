import { Component, Input } from "@angular/core";
import { UserBaseDto } from "../../feature/users/data/user-base.dto";
import { UserLeaderboardDto } from "../../feature/users/data/user-leaderboard.dto";
import { NgIf, NgClass, DatePipe, NgFor } from "@angular/common";
import { UserCardComponent } from "../user-card/user-card.component";
import { GroupLeaderboardDto } from "../../feature/groups/data/group-leaderboard.dto";


@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [NgIf,NgClass,DatePipe,UserCardComponent,NgFor],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss'
})
export class UserListComponent {
    @Input({required: true}) users!: (UserLeaderboardDto | GroupLeaderboardDto)[];
    
}