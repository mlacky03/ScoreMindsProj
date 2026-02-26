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

@Component({
    selector: 'app-rank',
    standalone: true,
    imports: [RankListComponent,CommonModule,NgIf   ],
    templateUrl: './rank.component.html',
    styleUrl: './rank.component.scss'
})
export class RankComponent implements OnInit, OnDestroy {
    private groupService = inject(GroupService);
    private userService = inject(UserService);
    private socketService = inject(SocketService);
    private sub = new Subscription();

    users = signal<UserLeaderboardDto[]>([]);
    groups = signal<GroupLeaderboardDto[]>([]);
    
    
    activeTab = signal<'users' | 'groups'>('users');
    loading = signal(true);

    ngOnInit() {
        this.loading.set(true);
        
        
        this.sub.add(
            forkJoin({
                users: this.userService.getLeaderboard(),
                groups: this.groupService.getLeaderboard()
            }).subscribe({
                next: (res) => {
                    this.users.set(res.users as UserLeaderboardDto[]);
                    this.groups.set(res.groups as GroupLeaderboardDto[]);
                    console.log(this.users());
                    console.log(this.groups());
                    this.loading.set(false); 
                },
                error: (err) => {
                    console.error('Greška pri učitavanju tabele', err);
                    this.loading.set(false);
                }
            })
        );
    }

    
    switchTab(tab: 'users' | 'groups') {
        this.activeTab.set(tab);
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }
}