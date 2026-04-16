import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ChatProduct } from '../../services/chat.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent {
  chatService = inject(ChatService);
  
  get product() {
    return this.chatService.selectedProduct();
  }

  get relatedProducts(): ChatProduct[] {
    const current = this.product;
    if (!current) return [];
    
    const msgs = this.chatService.messages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].products && msgs[i].products!.length > 0) {
        return msgs[i].products!.filter((p: ChatProduct) => p.sku !== current.sku);
      }
    }
    return [];
  }

  onWheel(event: WheelEvent, element: HTMLElement) {
    if (element.scrollWidth > element.clientWidth) {
      if (Math.abs(event.deltaY) > 0) {
        event.preventDefault();
        element.scrollLeft += event.deltaY * 1.5;
      }
    }
  }
}
