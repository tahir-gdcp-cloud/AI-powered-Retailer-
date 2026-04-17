import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html'
})
export class ChatInputComponent implements OnInit, OnDestroy {
  messageContent = '';
  chatService = inject(ChatService);

  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;

  placeholders = [
    'Search stores or products...',
    'Check local inventory for Macbook Pro...',
    'Compare prices for iPhone 15...',
    'Find verified grocery stores nearby...',
    'Are there active sales nearby?'
  ];
  currentPlaceholder = this.placeholders[0];
  placeholderIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholders.length;
      this.currentPlaceholder = this.placeholders[this.placeholderIndex];
    }, 3000); // changes every 1.5s for readability
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  autoResize() {
    if (this.textareaRef) {
      const textarea = this.textareaRef.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }

  sendMessage() {
    if (this.messageContent.trim()) {
      this.chatService.sendMessage(this.messageContent);
      this.messageContent = '';
      if (this.textareaRef) {
        this.textareaRef.nativeElement.style.height = 'auto';
      }
    }
  }

  stopGeneration() {
    this.chatService.stopGeneration();
  }
}
