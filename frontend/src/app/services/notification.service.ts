import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface Notification {
  id: string;
  userId: number;
  message: string;
  type: 'outbid' | 'won' | 'ending';
  read: boolean;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  notifications = signal<Notification[]>([]);
  private pollInterval: any;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.startPolling();
  }

  startPolling() {
    this.fetchNotifications();
    this.pollInterval = setInterval(() => {
      this.fetchNotifications();
    }, 5000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchNotifications() {
     const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
     if (!notificationsEnabled) return;

     const user = this.authService.getCurrentUser();
     if (!user) return;

     this.http.get<{success: boolean, notifications: Notification[]}>(`${this.apiUrl}/${user.id}`)
       .subscribe({
         next: (res) => {
           if (res.success) {
             this.notifications.set(res.notifications.filter(n => !n.read));
           }
         },
         error: (err) => console.error('Failed to fetch notifications', err)
       });
  }

  markAsRead(id: string) {
    this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(notifs => notifs.filter(n => n.id !== id));
      },
      error: (err) => console.error('Failed to mark notification as read', err)
    });
  }
}
