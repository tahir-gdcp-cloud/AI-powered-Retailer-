import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule, NetworkBackgroundComponent],
  templateUrl: './thank-you.component.html'
})
export class ThankYouComponent {
  router = inject(Router);
}
