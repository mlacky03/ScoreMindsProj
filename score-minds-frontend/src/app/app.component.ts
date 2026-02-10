import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from './core/services/socket.service';
import { map, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuth } from './core/auth/state/auth.selectors';
import { distinctUntilChanged, filter, take } from 'rxjs';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, NavBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private socketService = inject(SocketService); 
  private store = inject(Store);
  private routerSubscription: Subscription | undefined;

  ngOnInit() {
    // Logika ostaje ista: Čekamo da se uloguje
    this.store.select(selectAuth).pipe(
      map(a => a?.status === 'authenticated'),
      distinctUntilChanged(),
      filter(Boolean),
      take(1)
    ).subscribe(() => {
        // 2. Umesto reviewListener.init(), zovemo socket connect
        this.socketService.connect();
    });

    // ... router logika ostaje ista
  }

  ngOnDestroy() {
    // 3. Gasimo konekciju kad se aplikacija uništi (npr. refresh)
    this.socketService.disconnect();
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}