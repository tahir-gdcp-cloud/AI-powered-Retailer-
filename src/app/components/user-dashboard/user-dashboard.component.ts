import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';
import { CheckoutService } from '../../services/checkout.service';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
}

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  joinedDate: string;
  address: string;
  city: string;
  postalCode: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NetworkBackgroundComponent],
  templateUrl: './user-dashboard.component.html'
})
export class UserDashboardComponent implements OnInit {
  checkoutService = inject(CheckoutService);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  userProfile = signal<UserProfile | null>(null);
  userOrders = signal<Order[]>([]);

  ngOnInit() {
    this.fetchDashboardData();
  }

  async fetchDashboardData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      // Fetch both orders and user info simultaneously
      const [ordersResponse, userInfoResponse] = await Promise.all([
        this.checkoutService.getOrderStatus('my-orders').toPromise().catch(() => []),
        this.checkoutService.getUserInfo().toPromise().catch(() => null)
      ]);
      
      // Process Orders
      if (Array.isArray(ordersResponse)) {
        const orders = ordersResponse.map((o: any) => ({
          id: `ORD-${o.id}`,
          date: o.created_at,
          totalAmount: o.total_amount,
          status: o.status,
          paymentMethod: o.payment_method,
          items: o.items.map((i: any) => ({
            id: i.product_id,
            title: i.title,
            quantity: i.quantity,
            price: i.price
          }))
        }));
        this.userOrders.set(orders);
      } else {
        this.userOrders.set([]);
      }

      // Process User Info
      if (userInfoResponse && userInfoResponse.data) {
        const data = userInfoResponse.data;
        this.userProfile.set({
          fullName: data.full_name || data.fullName || 'Guest User',
          email: data.email || '',
          phone: data.phone || '',
          joinedDate: data.created_at || data.createdAt || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postal_code || data.postalCode || ''
        });
      } else if (Array.isArray(ordersResponse) && ordersResponse.length > 0) {
        // Fallback to order details if user info is not found but they have orders
        const latest = ordersResponse[0];
        this.userProfile.set({
          fullName: latest.full_name || 'Guest User',
          email: latest.email || '',
          phone: latest.phone || '',
          joinedDate: latest.created_at || '',
          address: latest.address || '',
          city: latest.city || '',
          postalCode: latest.postal_code || ''
        });
      } else {
        // Fallback to empty state
        this.userProfile.set({
          fullName: 'Guest User',
          email: '',
          phone: '',
          joinedDate: '',
          address: '',
          city: '',
          postalCode: ''
        });
      }

    } catch (error) {
      this.errorMessage.set('Failed to load dashboard data. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
