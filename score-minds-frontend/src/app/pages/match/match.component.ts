import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf,NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map, distinctUntilChanged, switchMap} from 'rxjs/operators';
import { MatchListComponent } from '../../components/match-list/match-list.component';
import { MatchService } from '../../feature/match/match.service';
import { MatchBaseDto } from '../../feature/match/data/match-base.dto';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatchViewComponent } from '../../components/match-view/match-view.component';
import { SocketService } from '../../core/services/socket.service';



@Component({
    selector: 'app-match',
    standalone: true,
    imports: [MatchListComponent,NgIf,NgClass,CommonModule,MatchViewComponent],
    templateUrl: './match.component.html',
    styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit, OnDestroy    {
    private matchService = inject(MatchService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    

    private socketService = inject(SocketService); 
    private socketSub?: Subscription;
    
    private pollingSubscription?: Subscription;
    allMatches = signal<MatchBaseDto[]>([]);

    filter = signal<'all' | 'upcoming'|'live'>('upcoming');
    selectedMatchId=signal<number|null>(null);

    displayedMatches = computed(() => {
        const matches = this.allMatches();
        const currentFilter = this.filter();

        switch (currentFilter) {
            case 'live':
                return matches.filter(m => m.status === 'LIVE' );
            
            case 'upcoming':
                return matches.filter(m => m.status === 'NS');

            case 'all':
            default:
                return matches;
        }
    });
    
    ngOnInit() {
        
        this.matchService.getAllMatches().subscribe({
            next: (ms) => this.allMatches.set(ms),
            error: (err) => {
                console.error('Greška pri učitavanju mečeva:', err);
            }
        });
        this.socketService.joinRoom('all_matches_list');

        this.socketSub = this.socketService.onMatchListUpdate().subscribe(data => {
            this.allMatches.update(currentMatches => {
                const index = currentMatches.findIndex(m => m.id === data.id);
                if (index === -1) return currentMatches;

                
                const newMatches = [...currentMatches];
                newMatches[index] = { ...newMatches[index], status: data.status };
                return newMatches;
            });
        });

        this.route.paramMap.pipe(
            map(pm => pm.get('id') ?? pm.get('matchId')),
            map(id => id ? Number(id) : null),
            distinctUntilChanged(),
        ).subscribe(id => {
            this.selectedMatchId.set(id);
        });
    }
    

    setFilter(newFilter: 'upcoming' | 'live' | 'all') {
        this.filter.set(newFilter);
    }    

    onSelect(matchId: number) {
      if (!matchId || this.selectedMatchId() === matchId) return;
      this.router.navigate(['/matches', matchId]);
    }

    ngOnDestroy() {
        this.socketService.leaveRoom('all_matches_list');
        this.socketSub?.unsubscribe();
    }
}