import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get userName(): string | null {
    return this.authService.userName();
  }

  logout() {
    this.authService.confirmLogout();
  }

  get sessionToDelete() {
    return this.chatService.sessionToDelete();
  }

  newChat() {
    this.chatService.clearChat();
  }

  loadSession(id: string) {
    this.chatService.loadSession(id);
  }

  confirmDelete(id: string, event: Event) {
    event.stopPropagation();
    this.chatService.confirmDelete(id);
  }

  cancelDelete() {
    this.chatService.cancelDelete();
  }

  executeDelete() {
    this.chatService.executeDelete();
  }
}
