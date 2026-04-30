import { Routes } from '@angular/router';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatLayoutComponent },
  { path: 'chat/:id', component: ChatLayoutComponent },
  { path: 'checkout', loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) },
  { path: 'thank-you', loadComponent: () => import('./components/thank-you/thank-you.component').then(m => m.ThankYouComponent) },
  { path: '**', redirectTo: 'chat' }
];
