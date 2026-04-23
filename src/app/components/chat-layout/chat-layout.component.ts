import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatMainComponent } from '../chat-main/chat-main.component';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';
import { ChatService } from '../../services/chat.service';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatMainComponent, NetworkBackgroundComponent, ProductDetailsComponent, RouterModule],
  templateUrl: './chat-layout.component.html'
})
export class ChatLayoutComponent {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private routeSub: Subscription | null = null;

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      const sessionId = params['id'];
      if (sessionId) {
        // Load the session if it's not already the active one
        if (this.chatService.currentSessionId() !== sessionId) {
          this.chatService.loadSession(sessionId);
        }
      } else {
        // No session ID means "New Chat" state
        if (this.chatService.currentSessionId() !== null) {
          this.chatService.clearChat();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  logout() {
    this.authService.confirmLogout();
  }
}
