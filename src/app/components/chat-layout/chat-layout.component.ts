import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChatMainComponent } from '../chat-main/chat-main.component';
import { NetworkBackgroundComponent } from '../network-background/network-background.component';
import { ChatService } from '../../services/chat.service';
import { ProductDetailsComponent } from '../product-details/product-details.component';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatMainComponent, NetworkBackgroundComponent, ProductDetailsComponent],
  templateUrl: './chat-layout.component.html'
})
export class ChatLayoutComponent {
  chatService = inject(ChatService);
}
