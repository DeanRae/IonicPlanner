import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabMenuPage } from './tab-menu.page';
import { AuthGuard } from 'src/app/services/user/auth.guard';

const routes: Routes = [
  {
    path: 'app',
    component: TabMenuPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../home/home.module').then(m => m.HomePageModule), canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'task-lists',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../task-lists/task-lists.module').then(m => m.TaskListsPageModule), 
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'calendar',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../calendar/calendar.module').then(m => m.CalendarPageModule), 
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'user-profile',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../user-profile/user-profile.module').then(m => m.UserProfilePageModule), 
              canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'app/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabMenuPageRoutingModule {}
