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
        return msgs[i].products!.filter((p: ChatProduct) => 
          p.sku !== current.sku && p.store.name === current.store.name
        );
      }
    }
    return [];
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

  handleProductClick(event: MouseEvent, product: any, scrollContainer: HTMLElement) {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.chatService.setProduct(product);
    scrollContainer.scrollTop = 0;
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
