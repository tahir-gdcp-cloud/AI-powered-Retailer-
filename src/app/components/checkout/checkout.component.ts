import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService, ChatProduct } from '../../services/chat.service';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NetworkBackgroundComponent],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  chatService = inject(ChatService);

  form = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: ''
  };

  selectedPaymentMethod = 'online';

  get product(): ChatProduct | null {
    return this.chatService.selectedProduct();
  }

  get totalPrice(): number {
    return this.product ? this.product.price : 0;
  }

  placeOrder() {
    // This is a placeholder for order submission logic.
    const method = this.selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment';
    alert(`Order placed successfully! Payment method: ${method}`);
  }
}
