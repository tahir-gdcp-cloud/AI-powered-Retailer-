import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'Online Payment' | 'Cash on Delivery';
  totalAmount: number;
  items: Array<{
    id: string | number;
    title: string;
    quantity: number;
    price: number;
  }>;
}

export interface CheckoutResponse {
  success: boolean;
  orderId: string;
  message: string;
  paymentUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:80';

  placeOrder(data: CheckoutRequest): Observable<CheckoutResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.post<CheckoutResponse>(`${this.baseUrl}/api/orders/checkout`, data, { headers });
  }

  getOrderStatus(orderId: string): Observable<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.http.get(`${this.baseUrl}/api/orders/${orderId}`, { headers });
  }

  getUserInfo(): Observable<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers: { [key: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return this.http.get(`${this.baseUrl}/api/orders/user-info`, { headers });
  }
}
