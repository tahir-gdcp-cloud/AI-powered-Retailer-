import { Routes } from '@angular/router';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatLayoutComponent },
  { path: 'chat/:id', component: ChatLayoutComponent },
  { path: 'checkout', loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./components/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) },
  { path: 'thank-you', canActivate: [authGuard], loadComponent: () => import('./components/thank-you/thank-you.component').then(m => m.ThankYouComponent) },
  { path: '**', redirectTo: 'chat' }
];
