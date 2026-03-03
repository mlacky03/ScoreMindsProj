import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RankState, userRankAdapter, groupRankAdapter } from './rank.reducer';
import { GroupLeaderboardDto } from '../../groups/data/group-leaderboard.dto';
import { UserLeaderboardDto } from '../../users/data/user-leaderboard.dto';

export const selectRankState = createFeatureSelector<RankState>('rank');

export const selectRankUsersState = createSelector(
  selectRankState,
  (state) => state.users
);

export const selectRankGroupsState = createSelector(
  selectRankState,
  (state) => state.groups
);

export const selectAllRankUsers = createSelector(
  selectRankUsersState,
  (state): UserLeaderboardDto[] => userRankAdapter.getSelectors().selectAll(state)
);

export const selectAllRankGroups = createSelector(
  selectRankGroupsState,
  (state): GroupLeaderboardDto[] => groupRankAdapter.getSelectors().selectAll(state)
);    


export const selectRankLoading = createSelector(
  selectRankState,
  (state) => state.loading
);