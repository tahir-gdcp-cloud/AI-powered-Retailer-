import { Routes } from '@angular/router';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatLayoutComponent },
  { path: 'chat/:id', component: ChatLayoutComponent },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: '**', redirectTo: 'chat' }
];
