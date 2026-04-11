import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  chatService = inject(ChatService);

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
