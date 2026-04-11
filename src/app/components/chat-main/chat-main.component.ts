import { Component, inject, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-main',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent, ChatInputComponent],
  templateUrl: './chat-main.component.html'
})
export class ChatMainComponent {
  chatService = inject(ChatService);
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      // This will trigger whenever messages change
      const msgs = this.chatService.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      if (this.chatService.messages().length > 0) {
        el.scrollTop = el.scrollHeight;
      } else {
        el.scrollTop = 0;
      }
    }
  }

  sendSuggestion(text: string) {
    this.chatService.sendMessage(text);
  }
}
