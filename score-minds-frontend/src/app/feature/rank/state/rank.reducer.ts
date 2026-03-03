import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { RankActions } from './rank.actions';
import { UserLeaderboardDto } from '../../../feature/users/data/user-leaderboard.dto';
import { GroupLeaderboardDto } from '../../../feature/groups/data/group-leaderboard.dto';


export const userRankAdapter: EntityAdapter<UserLeaderboardDto> = createEntityAdapter<UserLeaderboardDto>();
export const groupRankAdapter: EntityAdapter<GroupLeaderboardDto> = createEntityAdapter<GroupLeaderboardDto>();

export interface RankState {
  users: EntityState<UserLeaderboardDto>;
  groups: EntityState<GroupLeaderboardDto>;
  loading: boolean;
  error: string | null;
}


export const initialRankState: RankState = {
  users: userRankAdapter.getInitialState(),
  groups: groupRankAdapter.getInitialState(),
  loading: false,
  error: null,
};


export const rankReducer = createReducer(
  initialRankState,
  
  on(RankActions.loadLeaderboards, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  
  on(RankActions.loadLeaderboardsSuccess, (state, { users, groups }) => {
    const stateWithUsers = userRankAdapter.setAll(users, state.users);
    const stateWithGroups = groupRankAdapter.setAll(groups, state.groups);
    
    return {
      ...state,
      users: stateWithUsers,
      groups: stateWithGroups,
      loading: false
    };
  }),

  on(RankActions.loadLeaderboardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);