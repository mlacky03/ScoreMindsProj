import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RankState, userRankAdapter, groupRankAdapter } from './rank.reducer';

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
  userRankAdapter.getSelectors().selectAll
);

export const selectAllRankGroups = createSelector(
  selectRankGroupsState,
  groupRankAdapter.getSelectors().selectAll
);

export const selectRankLoading = createSelector(
  selectRankState,
  (state) => state.loading
);