import { Routes } from '@angular/router';
import { OfflineComponent } from './pages/utillty/offline/offline.component';
import { Error500Component } from './pages/utillty/error500/error500.component';
import { Error404Component } from './pages/utillty/error404/error404.component';
import {
  authGuard,
  matchAuthGuard,
  redirectLoggedInToApp,
} from './core/guards/auth.guard';
import { PredictionAllComponent } from './pages/prediction/prediction-all/prediction-all.component';

export const routes: Routes = [
  // public
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/dashboard/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'login',
    pathMatch: 'full',
    canMatch: [redirectLoggedInToApp],
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: 'register',
    pathMatch: 'full',
    canMatch: [redirectLoggedInToApp],
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  //private
  {
    path: 'me',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/user/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'groups/create',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/groups/group-create/group-create.component').then(
        (m) => m.GroupCreateComponent
      ),
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/match/match.component').then(
        (m) => m.MatchComponent
      ),
  },
  {
    path: 'matches/live',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/match/match.component').then(
        (m) => m.MatchComponent
      ),
  },
  {
    path: 'matches/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/match-view/match-view.component').then(
        (m) => m.MatchViewComponent
      ),
  },

  {
    path: 'predictions',
    component: PredictionAllComponent, 
    canActivate: [authGuard],
    children: [
      {
        path: ':id', 
        loadComponent: () => import('./components/prediction-view/prediction-view.component').then(m => m.PredictionViewComponent)
      }
    ]
  },
  {
    path: 'predictions/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/prediction-view/prediction-view.component').then(
        (m) => m.PredictionViewComponent
      ),
  },

//   {
//     path: 'groups/:id/expenses',
//     canActivate: [authGuard],
//     loadComponent: () =>
//       import('./pages/groups/group-expenses/group-expenses.component').then(
//         (m) => m.GroupExpensesComponent
//       ),
//   },

//   {
//     path: 'expenses/:expenseId/group/:groupId',
//     canActivate: [authGuard],
//     pathMatch: 'full',
//     loadComponent: () =>
//       import('./pages/expenses/expense-details/expense-details.component').then(
//         (m) => m.ExpenseDetailsComponent
//       ),
//   },
  {
    path: 'groups/:id',
    canActivate: [authGuard],
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/groups/groups-all/groups-all.component').then(
        (m) => m.GroupsAllComponent
      ),
  },

  {
    path: 'groups',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/groups/groups-all/groups-all.component').then(
        (m) => m.GroupsAllComponent
      ),
  },

  
  { path: 'offline', component: OfflineComponent },
  { path: '500', component: Error500Component },
  { path: '**', component: Error404Component },
];