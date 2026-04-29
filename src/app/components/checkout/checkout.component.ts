import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ChatService, ChatProduct } from '../../services/chat.service';
import { CheckoutService } from '../../services/checkout.service';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NetworkBackgroundComponent],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  chatService = inject(ChatService);
  checkoutService = inject(CheckoutService);
  router = inject(Router);

  form = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: ''
  };

  selectedPaymentMethod = 'online';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  successOrderId = signal<string | null>(null);
  hasSavedDetails = signal(false);

  ngOnInit() {
    this.checkSavedUserInfo();
  }

  async checkSavedUserInfo() {
    try {
      const response = await this.checkoutService.getUserInfo().toPromise();
      if (response && response.data) {
        const data = response.data;
        if (data.full_name && data.email && data.address) {
          this.form = {
            fullName: data.full_name || data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            postal: data.postal_code || data.postalCode || ''
          };
          this.hasSavedDetails.set(true);
        }
      }
    } catch (error) {
      console.error('Could not fetch saved user info', error);
    }
  }

  get product(): ChatProduct | null {
    return this.chatService.selectedProduct();
  }

  get totalPrice(): number {
    return this.product ? this.product.price : 0;
  }

  async placeOrder() {
    // Validation
    if (!this.form.fullName || !this.form.email || !this.form.phone || !this.form.address || !this.form.city || !this.form.postal) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (!this.product) {
      this.errorMessage.set('No product selected.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      this.errorMessage.set('You must be logged in to place an order.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const paymentMethod: 'Cash on Delivery' | 'Online Payment' = this.selectedPaymentMethod === 'cod'
        ? 'Cash on Delivery'
        : 'Online Payment';

      const checkoutData = {
        fullName: this.form.fullName,
        email: this.form.email,
        phone: this.form.phone,
        address: this.form.address,
        city: this.form.city,
        postalCode: this.form.postal,
        paymentMethod,
        totalAmount: this.totalPrice,
        items: [
          {
            id: this.product.id ?? this.product.sku,
            title: this.product.product_name,
            quantity: 1,
            price: this.product.price
          }
        ]
      };

      const response = await this.checkoutService.placeOrder(checkoutData).toPromise();

      // Check for success: either the explicit success flag or a message that sounds like success
      const isSuccess = response?.success || response?.message?.toLowerCase().includes('success');

      if (isSuccess) {
        this.successMessage.set(response?.message || 'Order placed successfully!');
        this.successOrderId.set(response?.orderId || null);
        
        // Auto-hide success message after 3 seconds if not redirecting to payment
        if (this.selectedPaymentMethod === 'online' && response?.paymentUrl) {
          setTimeout(() => {
            window.location.href = response!.paymentUrl!;
          }, 1500);
        } else {
          setTimeout(() => {
            this.successMessage.set(null);
            this.successOrderId.set(null);
            this.chatService.clearSelectedProduct();
            this.router.navigate(['/dashboard']);
          }, 2000);
        }
      } else {
        this.errorMessage.set(response?.message || 'Order failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const message = error.error?.message || error.message || '';
      if (message.toLowerCase().includes('success')) {
        this.successMessage.set(message);
        setTimeout(() => {
          this.successMessage.set(null);
          this.chatService.clearSelectedProduct();
          this.router.navigate(['/dashboard']);
        }, 2000);
      } else {
        this.errorMessage.set(error.error?.message || 'An error occurred while placing your order. Please try again.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
