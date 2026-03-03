import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { RankActions } from './rank.actions';
import { catchError, map, switchMap, forkJoin, of } from 'rxjs';
import { UserService } from '../../../feature/users/user.service';
import { GroupService } from '../../../feature/groups/group.service';

@Injectable()
export class RankEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private groupService = inject(GroupService);

  loadLeaderboards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RankActions.loadLeaderboards),
      switchMap(() =>
        forkJoin({
          users: this.userService.getLeaderboard(),
          groups: this.groupService.getLeaderboard()
        }).pipe(
          map((res) => RankActions.loadLeaderboardsSuccess({ 
            users: res.users as any, 
            groups: res.groups as any 
          })),
          catchError((error) => of(RankActions.loadLeaderboardsFailure({ error: error.message })))
        )
      )
    )
  );
}