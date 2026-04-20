import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NetworkBackgroundComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);

  isLoginMode = true;
  showPassword = false;

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
