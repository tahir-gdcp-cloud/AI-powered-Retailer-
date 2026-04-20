import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NetworkBackgroundComponent, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private authSubscription: Subscription | null = null;

  isLoginMode = true;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  get getGoogleButtonWidth(): number {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 400 ? 280 : 320;
    }
    return 320;
  }

  ngOnInit() {
    // If already logged in, don't show login page - redirect to chat
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat']);
      return;
    }

    this.authSubscription = this.socialAuthService.authState.subscribe({
      next: (user) => {
        if (user) {
          this.handleGoogleLogin(user.idToken, user.name, user.email);
        }
      },
      error: (err) => {
        console.error('Social Auth Error:', err);
        this.errorMessage = 'Failed to authenticate with Google.';
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  handleGoogleLogin(idToken: string, name?: string, email?: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.loginWithGoogle(idToken, name, email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Backend Auth Error:', err);
        this.errorMessage = err.error?.error || 'Authentication failed. Please try again.';
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userName(): string | null {
    return this.authService.userName();
  }

  logout() {
    this.authService.confirmLogout();
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    // Simulate authentication success by navigating back to chat
    this.router.navigate(['/chat']);
  }

  goBack() {
    this.router.navigate(['/chat']);
  }
}
