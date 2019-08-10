import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/user/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'ionic-planner', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'reset-password', loadChildren: './pages/reset-password/reset-password.module#ResetPasswordPageModule' },
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: 'signup', loadChildren: './pages/signup/signup.module#SignupPageModule' },
  { path: 'component-test-page', loadChildren: './pages/component-test-page/component-test-page.module#ComponentTestPagePageModule' },
  { path: 'user-profile', loadChildren: './pages/user-profile/user-profile.module#UserProfilePageModule', canActivate: [AuthGuard] },
  { path: 'calendar', loadChildren: './pages/calendar/calendar.module#CalendarPageModule', canActivate: [AuthGuard] },
  { path: 'ionic-planner', loadChildren: './pages/tab-menu/tab-menu.module#TabMenuPageModule', canActivate: [AuthGuard] },
  { path: 'task-lists', loadChildren: './pages/task-lists/task-lists.module#TaskListsPageModule', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
