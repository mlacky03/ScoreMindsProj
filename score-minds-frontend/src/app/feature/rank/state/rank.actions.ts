import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserLeaderboardDto } from '../../../feature/users/data/user-leaderboard.dto';
import { GroupLeaderboardDto } from '../../../feature/groups/data/group-leaderboard.dto';

export const RankActions = createActionGroup({
  source: 'Rank Leaderboard',
  events: {
    'Load Leaderboards': emptyProps(),
    'Load Leaderboards Success': props<{ 
      users: UserLeaderboardDto[], 
      groups: GroupLeaderboardDto[] 
    }>(),
    'Load Leaderboards Failure': props<{ error: string }>(),
  }
});