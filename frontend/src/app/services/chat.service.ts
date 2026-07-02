import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  auctionId: number;
  userId: number;
  userName: string;
  role: string;
  text: string;
  isAnnouncement: boolean;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/api';
  private socket: Socket | null = null;
  private messageSubject = new Subject<ChatMessage>();

  constructor(private http: HttpClient) {}

  /** Fetch message history from REST API (page load). */
  getHistory(auctionId: number): Observable<{ success: boolean; messages: ChatMessage[] }> {
    return this.http.get<{ success: boolean; messages: ChatMessage[] }>(
      `${this.apiUrl}/chat/${auctionId}`
    );
  }

  /** Connect to Socket.IO and join the auction room. */
  connect(auctionId: number): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      this.socket!.emit('join-auction', auctionId);
    });

    this.socket.on('new-message', (msg: ChatMessage) => {
      this.messageSubject.next(msg);
    });
  }

  /** Observable that emits each new incoming message. */
  onMessage(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  /** Send a chat message. */
  sendMessage(payload: {
    auctionId: number;
    userId: number;
    userName: string;
    role: string;
    text: string;
  }): void {
    if (this.socket) {
      this.socket.emit('send-message', payload);
    }
  }

  /** Disconnect and clean up. */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
