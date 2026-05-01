import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

export interface ProductStore {
  name: string;
  location: string;
  email: string;
  contact: string;
}

export interface ChatProduct {
  id?: number | string;
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
  private router = inject(Router);
  private abortController: AbortController | null = null;

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

    // 2. Sync to current session or create one
    this._syncCurrentSession(content);

    // 3. Trigger Request
    this._executeChatRequest(content);
  }

  resendFromMessage(originalMessage: ChatMessage, newContent: string) {
    const msgs = this.messages();
    const index = msgs.indexOf(originalMessage);
    if (index === -1) return;

    // 1. Truncate messages to this point and update the current message content
    const truncatedMsgs = msgs.slice(0, index);
    truncatedMsgs.push({ ...originalMessage, content: newContent });
    this.messages.set(truncatedMsgs);

    // 2. Clear product view to focus on new generation
    this.selectedProduct.set(null);

    // 3. Sync and trigger
    this._syncCurrentSession();
    this._executeChatRequest(newContent);
  }

  private async _executeChatRequest(content: string) {
    this.isTyping.set(true);
    this.abortController = new AbortController();

    // Add empty placeholder message that we will stream into
    this.messages.update(msgs => [...msgs, {
      role: 'assistant',
      content: '',
      products: [],
      intent: ''
    }]);

    try {
      const response = await fetch('https://wisemind.techbitsit.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: content }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this.messages.update(msgs => {
        const newMsgs = [...msgs];
        const lastMsg = { ...newMsgs[newMsgs.length - 1] };

        lastMsg.content = data.bot_response || '';
        lastMsg.products = data.products || [];
        lastMsg.intent = data.intent || '';

        newMsgs[newMsgs.length - 1] = lastMsg;
        return newMsgs;
      });

      this.abortController = null;
      this.isTyping.set(false);
      this._syncCurrentSession();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Chat API Error:', err);
        this.messages.update(msgs => {
          const newMsgs = [...msgs];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (!lastMsg.content) {
            lastMsg.content = 'An error occurred while communicating with the AI. Please try again later.';
          }
          return newMsgs;
        });
      }
      this.abortController = null;
      this.isTyping.set(false);
      this._syncCurrentSession();
    }
  }

  private _abortOngoingRequest(addCancelMessage: boolean = false) {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;

      if (addCancelMessage) {
        this.messages.update(msgs => {
          const newMsgs = [...msgs];
          const lastMsg = newMsgs[newMsgs.length - 1];

          if (lastMsg && lastMsg.role === 'assistant') {
            if (!lastMsg.content) {
              lastMsg.content = 'The response generation was cancelled !';
            } else {
              lastMsg.content += '\n\n*The response generation was cancelled !*';
            }
          } else {
            newMsgs.push({
              role: 'assistant',
              content: 'The response generation was cancelled !'
            });
          }
          return newMsgs;
        });
        this._syncCurrentSession();
      }
    }
    this.isTyping.set(false);
  }

  stopGeneration() {
    this._abortOngoingRequest(true);
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
      this.router.navigate(['/chat', newSession.id]);
    } else {
      // Update existing session
      this.sessions.update(sessions =>
        sessions.map(s => s.id === activeId ? { ...s, messages: this.messages() } : s)
      );
    }
    this.saveToLocalStorage();
  }

  clearChat() {
    this._abortOngoingRequest(false);
    this.messages.set([]);
    this.currentSessionId.set(null);
    this.selectedProduct.set(null);
    this.saveToLocalStorage();

    // On mobile, auto-close sidebar when starting new chat
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isSidebarOpen.set(false);
    }
  }

  loadSession(id: string, isInitialLoad = false) {
    const session = this.sessions().find(s => s.id === id);
    if (session) {
      this._abortOngoingRequest(false);
      this.messages.set(session.messages);
      this.currentSessionId.set(session.id);

      // Only clear product view on manual selection, not initial app boot
      if (!isInitialLoad) {
        this.selectedProduct.set(null);
      }

      this.saveToLocalStorage();
      // On mobile, auto-close sidebar when loading a chat (but skip if initial page load)
      if (!isInitialLoad && typeof window !== 'undefined' && window.innerWidth < 768) {
        this.isSidebarOpen.set(false);
      }
    }
  }

  deleteSession(id: string) {
    if (this.currentSessionId() === id) {
      this._abortOngoingRequest(false);
      this.sessions.update(s => s.filter(session => session.id !== id));
      this.clearChat();
      this.router.navigate(['/chat']);
    } else {
      this.sessions.update(s => s.filter(session => session.id !== id));
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
