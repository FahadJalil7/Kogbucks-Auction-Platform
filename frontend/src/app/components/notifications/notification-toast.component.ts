import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="notifications().length > 0">
      <div 
        *ngFor="let notification of notifications()" 
        class="toast"
        [ngClass]="notification.type"
        @fade
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span *ngIf="notification.type === 'outbid'">⚠️</span>
            <span *ngIf="notification.type === 'won'">🎉</span>
            <span *ngIf="notification.type === 'ending'">⏳</span>
          </div>
          <div class="toast-message">
            {{ notification.message }}
          </div>
          <button class="btn-close" (click)="dismiss(notification.id)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    }
    
    .toast {
      background: rgba(30, 41, 59, 0.95);
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-left: 4px solid #3b82f6;
      overflow: hidden;
      backdrop-filter: blur(8px);
    }
    
    .toast.outbid {
      border-left-color: #ef4444;
    }
    
    .toast.won {
      border-left-color: #10b981;
    }
    
    .toast.ending {
      border-left-color: #f59e0b;
    }
    
    .toast-content {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      gap: 12px;
    }
    
    .toast-icon {
      font-size: 20px;
      margin-top: -2px;
    }
    
    .toast-message {
      color: white;
      font-size: 14px;
      line-height: 1.4;
      flex-grow: 1;
    }
    
    .btn-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      margin: -4px -4px 0 0;
      transition: color 0.2s;
    }
    
    .btn-close:hover {
      color: white;
    }
  `],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(50px)' }))
      ])
    ])
  ]
})
export class NotificationToastComponent {
  notifications = this.notificationService.notifications;

  constructor(private notificationService: NotificationService) {}

  dismiss(id: string) {
    this.notificationService.markAsRead(id);
  }
}
