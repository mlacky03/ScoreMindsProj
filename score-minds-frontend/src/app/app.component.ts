import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { SocketService } from './core/services/socket.service';
import { map, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectAuth } from './core/auth/state/auth.selectors';
import { distinctUntilChanged, filter, take } from 'rxjs';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
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

  private authSubscription: Subscription | undefined;
  private authState = this.store.selectSignal(selectAuth);
  isAuthResolved = computed(() => {
    const status = this.authState()?.status;
    return status !== 'pending';
  });
  ngOnInit() {

    this.authSubscription = this.store.select(selectAuth).pipe(
     // filter(auth => auth?.status !== 'pending'),
      map(authState => authState?.status === 'authenticated'),

      distinctUntilChanged()
    ).subscribe((isAuthenticated) => {

      if (isAuthenticated) {
        console.log('🔐 Korisnik je ulogovan -> Povezujem Socket...');
        this.socketService.connect();
      } else {
        console.log('👋 Korisnik nije ulogovan -> Gasim Socket...');
        this.socketService.disconnect();
      }

    });


  }

  ngOnDestroy() {
    this.socketService.disconnect();

    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}