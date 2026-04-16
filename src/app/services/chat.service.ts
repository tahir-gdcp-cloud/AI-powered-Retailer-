import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ProductStore {
  name: string;
  location: string;
  email: string;
  contact: string;
}

export interface ChatProduct {
  product_name: string;
  category: string;
  price: number;
  in_stock: boolean;
  stock_count: number;
  sku: string;
  store: ProductStore;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
  intent?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messages = signal<ChatMessage[]>([]);
  isTyping = signal<boolean>(false);
  isSidebarOpen = signal<boolean>(false);

  // History State
  sessions = signal<ChatSession[]>([]);
  currentSessionId = signal<string | null>(null);
  sessionToDelete = signal<string | null>(null);
  selectedProduct = signal<ChatProduct | null>(null);

  private http = inject(HttpClient);

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedSessions = localStorage.getItem('chat_sessions');
      if (savedSessions) {
        try {
          this.sessions.set(JSON.parse(savedSessions));
        } catch (e) {
          console.error('Failed to parse chat sessions', e);
        }
      }

      const activeProduct = localStorage.getItem('selected_product');
      if (activeProduct) {
        try {
          this.selectedProduct.set(JSON.parse(activeProduct));
        } catch (e) {
          console.error(e);
        }
      }

      const activeId = localStorage.getItem('current_session_id');
      if (activeId) {
        this.loadSession(activeId, true); // true indicates initial load to avoid sidebar toggle side-effects
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_sessions', JSON.stringify(this.sessions()));
      localStorage.setItem('current_session_id', this.currentSessionId() || '');

      const prod = this.selectedProduct();
      if (prod) {
        localStorage.setItem('selected_product', JSON.stringify(prod));
      } else {
        localStorage.removeItem('selected_product');
      }
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  sendMessage(content: string) {
    if (!content.trim()) return;

    // 1. Update live UI messages
    this.messages.update(msgs => [...msgs, { role: 'user', content }]);
    this.isTyping.set(true);

    // 2. Sync to current session or create one
    this._syncCurrentSession(content);

    // 3. Real API Call
    this.http.post<any>('http://127.0.0.1/api/chat', { message: content }).subscribe({
      next: (response) => {
        const botResponse = response.bot_response || 'Sorry, I did not understand that.';
        this.messages.update(msgs => [...msgs, {
          role: 'assistant',
          content: botResponse,
          products: response.products,
          intent: response.intent
        }]);
        this.isTyping.set(false);
        this._syncCurrentSession();
      },
      error: (err) => {
        console.error('Chat API Error:', err);
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: 'An error occurred while communicating with the AI. Please try again later.' }]);
        this.isTyping.set(false);
        this._syncCurrentSession();
      }
    });
  }

  private _syncCurrentSession(initialContent?: string) {
    const activeId = this.currentSessionId();
    if (!activeId) {
      // Create new session from the very first message
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: initialContent ? initialContent.substring(0, 30) + (initialContent.length > 30 ? '...' : '') : 'New Chat',
        messages: this.messages(),
        date: new Date()
      };
      this.sessions.update(s => [newSession, ...s]);
      this.currentSessionId.set(newSession.id);
    } else {
      // Update existing session
      this.sessions.update(sessions =>
        sessions.map(s => s.id === activeId ? { ...s, messages: this.messages() } : s)
      );
    }
    this.saveToLocalStorage();
  }

  clearChat() {
    this.messages.set([]);
    this.currentSessionId.set(null);
    this.saveToLocalStorage();
  }

  loadSession(id: string, isInitialLoad = false) {
    const session = this.sessions().find(s => s.id === id);
    if (session) {
      this.messages.set(session.messages);
      this.currentSessionId.set(session.id);
      this.saveToLocalStorage();
      // On mobile, auto-close sidebar when loading a chat (but skip if initial page load)
      if (!isInitialLoad && typeof window !== 'undefined' && window.innerWidth < 768) {
        this.isSidebarOpen.set(false);
      }
    }
  }

  deleteSession(id: string) {
    this.sessions.update(s => s.filter(session => session.id !== id));
    if (this.currentSessionId() === id) {
      this.clearChat();
    } else {
      this.saveToLocalStorage();
    }
  }

  confirmDelete(id: string) {
    this.sessionToDelete.set(id);
  }

  cancelDelete() {
    this.sessionToDelete.set(null);
  }

  executeDelete() {
    const id = this.sessionToDelete();
    if (id) {
      this.deleteSession(id);
      this.sessionToDelete.set(null);
    }
  }

  setProduct(product: ChatProduct | null) {
    this.selectedProduct.set(product);
    this.saveToLocalStorage();
  }

  clearSelectedProduct() {
    this.selectedProduct.set(null);
    this.saveToLocalStorage();
  }
}
