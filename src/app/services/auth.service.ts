import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Using the host found in chat.service.ts
  private baseUrl = 'http://67.207.76.73/auth';

  // Profile Signals
  userName = signal<string | null>(null);
  userEmail = signal<string | null>(null);

  // Logout Confirmation State
  isLogoutConfirmOpen = signal(false);

  constructor() {
    this.loadProfile();
  }

  private loadProfile() {
    if (typeof window !== 'undefined') {
      this.userName.set(localStorage.getItem('user_name'));
      this.userEmail.set(localStorage.getItem('user_email'));
    }
  }

  loginWithGoogle(idToken: string, name?: string, email?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/google`, { id_token: idToken }).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);

          // Store profile details
          if (name) {
            localStorage.setItem('user_name', name);
            this.userName.set(name);
          }
          if (email) {
            localStorage.setItem('user_email', email);
            this.userEmail.set(email);
          }
        }
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
      })
    );
  }

  confirmLogout() {
    this.isLogoutConfirmOpen.set(true);
  }

  cancelLogout() {
    this.isLogoutConfirmOpen.set(false);
  }

  executeLogout() {
    this.isLogoutConfirmOpen.set(false);
    this.logout();
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('chat_sessions');
    localStorage.removeItem('current_session_id');

    this.userName.set(null);
    this.userEmail.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
