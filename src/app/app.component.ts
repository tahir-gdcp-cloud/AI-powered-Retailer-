import { Component } from '@angular/core';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ai-chat-ui';
}
