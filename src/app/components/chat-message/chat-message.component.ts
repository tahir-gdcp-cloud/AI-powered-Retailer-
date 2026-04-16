import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html'
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;
  chatService = inject(ChatService);

  onWheel(event: WheelEvent, element: HTMLElement) {
    if (element.scrollWidth > element.clientWidth) {
      if (Math.abs(event.deltaY) > 0) {
        event.preventDefault();
        element.scrollLeft += event.deltaY * 1.5;
      }
    }
  }
}
