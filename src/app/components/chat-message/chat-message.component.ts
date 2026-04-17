import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage, ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.css'
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessage;
  chatService = inject(ChatService);

  isEditing = false;
  editedContent = '';
  showCopySuccess = false;

  copyToClipboard() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(this.message.content).then(() => {
        this.showCopySuccess = true;
        setTimeout(() => this.showCopySuccess = false, 2000);
      });
    }
  }

  startEdit() {
    if (this.message.role === 'user') {
      this.isEditing = true;
      this.editedContent = this.message.content;
      // Auto-resize on next tick to ensure DOM is ready
      setTimeout(() => {
        const textarea = document.querySelector('textarea.edit-textarea') as HTMLTextAreaElement;
        if (textarea) this.adjustTextAreaHeight(textarea);
      }, 0);
    }
  }

  onEditInput(event: Event) {
    this.adjustTextAreaHeight(event.target as HTMLTextAreaElement);
  }

  private adjustTextAreaHeight(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveEdit() {
    if (this.editedContent.trim() && this.editedContent !== this.message.content) {
      this.chatService.resendFromMessage(this.message, this.editedContent);
    }
    this.isEditing = false;
  }

  isDown = false;
  startX = 0;
  scrollLeft = 0;
  hasDragged = false;

  onWheel(event: WheelEvent, element: HTMLElement) {
    if (element.scrollWidth > element.clientWidth) {
      if (Math.abs(event.deltaY) > 0) {
        event.preventDefault();
        element.scrollLeft += event.deltaY * 1.5;
      }
    }
  }

  onMouseDown(event: MouseEvent, element: HTMLElement) {
    this.isDown = true;
    this.hasDragged = false;
    this.startX = event.pageX - element.offsetLeft;
    this.scrollLeft = element.scrollLeft;
  }

  onMouseLeave() {
    this.isDown = false;
  }

  onMouseUp() {
    this.isDown = false;
  }

  onMouseMove(event: MouseEvent, element: HTMLElement) {
    if (!this.isDown) return;
    event.preventDefault();
    const x = event.pageX - element.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    
    if (Math.abs(walk) > 5) {
      this.hasDragged = true;
    }
    element.scrollLeft = this.scrollLeft - walk;
  }

  handleProductClick(event: MouseEvent, product: any) {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.chatService.setProduct(product);
  }

  scrollCarousel(element: HTMLElement, direction: number) {
    const scrollAmount = 260 * direction;
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    if (direction > 0 && element.scrollLeft >= maxScroll - 10) {
      element.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction < 0 && element.scrollLeft <= 10) {
      element.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
