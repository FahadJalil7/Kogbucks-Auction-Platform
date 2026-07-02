import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="glass-panel settings-card">
        <div class="settings-header">
          <button class="btn-back" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <h1>Settings</h1>
        </div>
        
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Notifications</h3>
              <p>Enable or disable push notifications</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationsEnabled" (change)="onNotificationToggle()">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="notification-status" [class.enabled]="notificationsEnabled">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="currentColor"/>
            </svg>
            <span>Notifications are {{ notificationsEnabled ? 'enabled' : 'disabled' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      color: white;
    }
    
    .settings-card {
      padding: 0;
      width: 100%;
      max-width: 600px;
      overflow: hidden;
    }
    
    .settings-header {
      padding: 30px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }
    
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }
    
    .btn-back:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(-2px);
    }
    
    .settings-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .settings-content {
      padding: 30px;
    }
    
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    
    .setting-item:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .setting-info h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .setting-info p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      flex-shrink: 0;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.4s ease;
      border-radius: 34px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 2px;
      bottom: 2px;
      background: white;
      transition: all 0.4s ease;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    input:checked + .slider {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-color: transparent;
    }
    
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    
    .slider:hover {
      background: rgba(255, 255, 255, 0.25);
    }
    
    input:checked + .slider:hover {
      background: linear-gradient(135deg, #7c3aed, #c084fc);
    }
    
    .notification-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      font-size: 14px;
      color: #fca5a5;
      transition: all 0.3s ease;
    }
    
    .notification-status.enabled {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
      color: #86efac;
    }
    
    .notification-status svg {
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class SettingsComponent {
  notificationsEnabled: boolean = true;

  constructor(private router: Router) {
    // Load saved preference from localStorage
    const savedPref = localStorage.getItem('notificationsEnabled');
    if (savedPref !== null) {
      this.notificationsEnabled = savedPref === 'true';
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onNotificationToggle() {
    // Save preference to localStorage
    localStorage.setItem('notificationsEnabled', this.notificationsEnabled.toString());
    console.log('Notifications:', this.notificationsEnabled ? 'Enabled' : 'Disabled');
  }
}
