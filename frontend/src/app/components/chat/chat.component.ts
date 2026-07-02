import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container glass-panel">
      <div class="chat-header">
        <div class="chat-title">
          <span class="chat-icon">💬</span>
          <span>Live Auction Chat</span>
          <span class="online-dot"></span>
        </div>
        <span class="msg-count">{{ messages.length }} messages</span>
      </div>

      <!-- Message List -->
      <div class="chat-messages" #scrollTarget>
        <div *ngIf="messages.length === 0" class="empty-chat">
          <span>No messages yet. Be the first to say something! 👋</span>
        </div>

        <div *ngFor="let msg of messages" class="msg-wrapper"
             [ngClass]="{
               'msg-own': msg.userId === currentUser?.id && !msg.isAnnouncement,
               'msg-other': msg.userId !== currentUser?.id && !msg.isAnnouncement,
               'msg-announcement': msg.isAnnouncement
             }">

          <!-- Announcement (admin broadcast) -->
          <div *ngIf="msg.isAnnouncement" class="announcement-bubble" [@fadeIn]>
            <span class="announcement-icon">📢</span>
            <div class="announcement-body">
              <span class="announcement-author">{{ msg.userName }}</span>
              <span class="announcement-text">{{ msg.text }}</span>
            </div>
            <span class="announcement-time">{{ formatTime(msg.timestamp) }}</span>
          </div>

          <!-- Regular chat bubble -->
          <div *ngIf="!msg.isAnnouncement" class="bubble-row">
            <div class="avatar-small" [title]="msg.userName">
              {{ msg.userName.charAt(0).toUpperCase() }}
            </div>
            <div class="bubble-content">
              <div class="bubble-meta">
                <span class="bubble-name">{{ msg.userId === currentUser?.id ? 'You' : msg.userName }}</span>
                <span class="role-pill" [ngClass]="msg.role === 'admin' ? 'pill-admin' : 'pill-rep'">
                  {{ msg.role === 'admin' ? 'Host' : 'Rep' }}
                </span>
                <span class="bubble-time">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <div class="bubble" [ngClass]="msg.userId === currentUser?.id ? 'bubble-mine' : 'bubble-theirs'">
                {{ msg.text }}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <!-- Admin-only announcement checkbox -->
        <div class="announce-toggle" *ngIf="isAdmin">
          <label class="toggle-label" [class.announce-active]="isAnnouncing">
            <input type="checkbox" [(ngModel)]="isAnnouncing" id="announceToggle">
            📢 Announce
          </label>
        </div>

        <div class="input-row" [class.input-announce-mode]="isAnnouncing && isAdmin">
          <input
            type="text"
            class="chat-input"
            [(ngModel)]="inputText"
            (keydown.enter)="sendMessage()"
            [placeholder]="isAnnouncing ? 'Type an announcement…' : 'Ask a question or say something…'"
            maxlength="500"
          />
          <button class="btn-send" (click)="sendMessage()" [disabled]="!inputText.trim()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Container ── */
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 480px;
      margin-top: 30px;
      overflow: hidden;
      border-radius: 16px;
    }

    /* ── Header ── */
    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }
    .chat-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 15px;
    }
    .chat-icon { font-size: 18px; }
    .online-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34,197,94,0.7);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%,100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .msg-count { font-size: 12px; color: rgba(255,255,255,0.4); }

    /* ── Message list ── */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

    .empty-chat {
      text-align: center;
      color: rgba(255,255,255,0.35);
      font-size: 13px;
      margin: auto;
    }

    /* ── Message wrappers ── */
    .msg-wrapper { display: flex; flex-direction: column; animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* ── Announcement ── */
    .announcement-bubble {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, rgba(234,179,8,0.18), rgba(245,158,11,0.08));
      border: 1px solid rgba(234,179,8,0.35);
      border-radius: 10px;
      padding: 10px 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .announcement-icon { font-size: 18px; flex-shrink: 0; }
    .announcement-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .announcement-author { font-size: 11px; font-weight: 700; color: #eab308; text-transform: uppercase; letter-spacing: 0.5px; }
    .announcement-text { font-size: 14px; color: #fef9c3; line-height: 1.4; }
    .announcement-time { font-size: 10px; color: rgba(255,255,255,0.35); flex-shrink: 0; align-self: flex-start; margin-top: 2px; }

    /* ── Regular bubbles ── */
    .bubble-row { display: flex; gap: 8px; align-items: flex-end; }

    .msg-own .bubble-row { flex-direction: row-reverse; }
    .msg-own .bubble-meta { flex-direction: row-reverse; }

    .avatar-small {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(41,128,185,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      flex-shrink: 0;
    }
    .msg-own .avatar-small { background: rgba(41,128,185,0.7); }

    .bubble-content { display: flex; flex-direction: column; gap: 4px; max-width: 75%; }
    .bubble-meta { display: flex; align-items: center; gap: 6px; }
    .bubble-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); }
    .bubble-time { font-size: 10px; color: rgba(255,255,255,0.3); }

    .role-pill {
      font-size: 9px; font-weight: 700; padding: 1px 6px;
      border-radius: 20px; letter-spacing: 0.4px; text-transform: uppercase;
    }
    .pill-admin { background: rgba(234,179,8,0.25); color: #eab308; border: 1px solid rgba(234,179,8,0.4); }
    .pill-rep   { background: rgba(41,128,185,0.2); color: #63b5eb; border: 1px solid rgba(41,128,185,0.3); }

    .bubble {
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .bubble-mine {
      background: linear-gradient(135deg, #2980b9, #216694);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .bubble-theirs {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
      border-bottom-left-radius: 4px;
    }

    /* ── Input area ── */
    .chat-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    .announce-toggle { display: flex; align-items: center; }
    .toggle-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      color: rgba(255,255,255,0.5);
      transition: color 0.2s;
      user-select: none;
    }
    .toggle-label input[type="checkbox"] {
      width: auto; padding: 0;
      accent-color: #eab308;
    }
    .toggle-label.announce-active { color: #eab308; }

    .input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 4px 4px 4px 12px;
      transition: border-color 0.2s;
    }
    .input-row:focus-within { border-color: rgba(41,128,185,0.6); }
    .input-announce-mode { border-color: rgba(234,179,8,0.5) !important; background: rgba(234,179,8,0.06) !important; }

    .chat-input {
      flex: 1;
      background: transparent !important;
      border: none !important;
      color: white;
      font-size: 13.5px;
      padding: 6px 0;
      outline: none;
      width: auto;
    }
    .chat-input::placeholder { color: rgba(255,255,255,0.3); }

    .btn-send {
      width: 36px; height: 36px;
      border-radius: 8px;
      border: none;
      background: var(--accent-gradient);
      color: white;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s, transform 0.15s;
    }
    .btn-send:hover:not(:disabled) { transform: scale(1.08); }
    .btn-send:disabled { opacity: 0.35; cursor: not-allowed; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() auctionId!: number;
  @ViewChild('scrollTarget') private scrollTarget!: ElementRef;

  messages: ChatMessage[] = [];
  inputText: string = '';
  isAnnouncing: boolean = false;
  currentUser: any = null;
  isAdmin: boolean = false;

  private msgSub?: Subscription;
  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'admin';

    // Load history first, then open socket
    this.chatService.getHistory(this.auctionId).subscribe(res => {
      if (res.success) {
        this.messages = res.messages;
        this.shouldScroll = true;
      }
    });

    this.chatService.connect(this.auctionId);

    this.msgSub = this.chatService.onMessage().subscribe(msg => {
      this.messages.push(msg);
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
    this.chatService.disconnect();
  }

  sendMessage() {
    const text = this.inputText.trim();
    if (!text || !this.currentUser) return;

    this.chatService.sendMessage({
      auctionId: this.auctionId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      role: this.isAnnouncing ? 'admin' : this.currentUser.role,
      text
    });

    this.inputText = '';
  }

  formatTime(timestamp: string): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    try {
      const el = this.scrollTarget?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
