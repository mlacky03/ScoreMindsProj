import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule, NgClass, NgIf } from "@angular/common";
import { forkJoin, Subscription } from "rxjs";

import { GroupService } from "../../feature/groups/group.service";
import { UserService } from "../../feature/users/user.service";
import { SocketService } from "../../core/services/socket.service";
import { UserLeaderboardDto } from "../../feature/users/data/user-leaderboard.dto";
import { GroupLeaderboardDto } from "../../feature/groups/data/group-leaderboard.dto";
import { RankListComponent } from "../../components/rank-list/rank-list.component";
import { GroupListComponent } from "../../components/group-list/group-list.component";
import { Store } from "@ngrx/store";
import { selectAllRankGroups, selectAllRankUsers, selectRankLoading } from "../../feature/rank/state/rank.selectors";
import { RankActions } from "../../feature/rank/state/rank.actions";

@Component({
    selector: 'app-rank',
    standalone: true,
    imports: [RankListComponent,CommonModule,NgIf   ],
    templateUrl: './rank.component.html',
    styleUrl: './rank.component.scss'
})
export class RankComponent implements OnInit, OnDestroy {
    private store = inject(Store);
    private sub = new Subscription();

    users = this.store.selectSignal(selectAllRankUsers);
    groups = this.store.selectSignal(selectAllRankGroups);
    loading = this.store.selectSignal(selectRankLoading);   
    
    
    activeTab = signal<'users' | 'groups'>('users');

    ngOnInit() {
        const hasUsers = this.users().length > 0;
        if(!hasUsers)
            this.store.dispatch(RankActions.loadLeaderboards());
    }

    
    switchTab(tab: 'users' | 'groups') {
        this.activeTab.set(tab);
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}