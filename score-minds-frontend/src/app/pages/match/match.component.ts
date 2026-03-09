import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map, distinctUntilChanged, switchMap, debounceTime } from 'rxjs/operators';
import { MatchListComponent } from '../../components/match-list/match-list.component';
import { MatchService } from '../../feature/match/match.service';
import { MatchBaseDto } from '../../feature/match/data/match-base.dto';
import {  Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { SocketService } from '../../core/services/socket.service';



@Component({
    selector: 'app-match',
    standalone: true,
    imports: [MatchListComponent, NgIf, CommonModule],
    templateUrl: './match.component.html',
    styleUrl: './match.component.scss'
})
export class MatchComponent implements OnInit, OnDestroy {
    private matchService = inject(MatchService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);


    private socketService = inject(SocketService);
    private socketSub?: Subscription;
    private httpSub?: Subscription;

    private silentRefreshTrigger = new Subject<void>();
    private refreshSub?: Subscription;

    displayedMatches = signal<MatchBaseDto[]>([]);

    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(8);
    loading = signal<boolean>(false);

    filter = signal<'all' | 'upcoming' | 'live'>('upcoming');
    selectedMatchId = signal<number | null>(null);
    hasMore = signal<boolean>(true);



    ngOnInit() {
        this.socketService.joinRoom('all_matches_list');

        this.loadMatches();
        this.refreshSub = this.silentRefreshTrigger.pipe(
            debounceTime(500)
        ).subscribe(() => {
            this.loadMatches(true);
        });

        this.socketSub = this.socketService.onMatchListUpdate().subscribe(data => {
            console.log('Stigli su podaci za mec u live:', data);
            const currentFilter = this.filter();
            let needsSilentRefresh = false;
            this.displayedMatches.update(currentMatches => {
                const index = currentMatches.findIndex(m => m.id === data.id);

                if (index === -1) {
                    if (currentFilter === 'live' && data.status === 'LIVE') {
                        needsSilentRefresh = true;
                    }
                    if (currentFilter === 'all' && data.status === 'FT') {
                        needsSilentRefresh = true;
                    }
                    return currentMatches;
                }
                const newMatches = [...currentMatches];
                newMatches[index] = { ...newMatches[index], ...data };

                if (currentFilter === 'upcoming' && data.status === 'LIVE') {
                    newMatches.splice(index, 1);
                    needsSilentRefresh = true;
                   
                }

                if (currentFilter === 'live' && data.status === 'FT') {
                    newMatches.splice(index, 1);
                    needsSilentRefresh = true;
                   
                }

                return newMatches;
            });

            if (needsSilentRefresh) {
                this.silentRefreshTrigger.next();
            }
        });

        this.route.paramMap.pipe(
            map(pm => pm.get('id') ?? pm.get('matchId')),
            map(id => id ? Number(id) : null),
            distinctUntilChanged(),
        ).subscribe(id => {
            this.selectedMatchId.set(id);
        });
    }

    loadMatches(isSilent: boolean = false) {
        if (!isSilent) {
            this.loading.set(true);
        }
        if (this.httpSub) {
            this.httpSub.unsubscribe();
        }



        const page = this.currentPage();
        const size = this.itemsPerPage();
        const currentFilter = this.filter();

        let request$;

        if (currentFilter === 'all') {
            request$ = this.matchService.getHistoryMatches(page, size);
        }
        else if (currentFilter == 'live') {
            request$ = this.matchService.getLiveMathes(page, size);
        }
        else {
            request$ = this.matchService.getUpcomingMatches(page, size);
        }

        this.httpSub = request$.subscribe({
            next: (ms) => {
                console.log("Mecevi Povuceni: ", ms);
                this.displayedMatches.set(ms);
                this.hasMore.set(ms.length === size);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Greška pri učitavanju mečeva:', err);
                this.loading.set(false);
            }
        });
    }


    setFilter(newFilter: 'upcoming' | 'live' | 'all') {
        if (this.filter() === newFilter) return;

        this.filter.set(newFilter);
        this.currentPage.set(1);
        this.loadMatches();
    }

    changePage(step: number) {
        const newPage = this.currentPage() + step;
        if (newPage > 0) {
            this.currentPage.set(newPage);
            this.loadMatches();
        }
    }


    onSelect(matchId: number) {
        if (!matchId || this.selectedMatchId() === matchId) return;
        this.router.navigate(['/matches', matchId]);
    }


    ngOnDestroy() {
        this.socketService.leaveRoom('all_matches_list');
        this.socketSub?.unsubscribe();

        this.refreshSub?.unsubscribe();
        this.httpSub?.unsubscribe();
    }
}