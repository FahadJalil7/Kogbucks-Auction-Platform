import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="glass-panel admin-card">
        <div class="admin-header">
          <button class="btn-back" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <h1>Admin Panel</h1>
          <p class="subtitle">Manage User Kogbucks</p>
        </div>
        
        <div class="admin-content">
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading users...</p>
          </div>
          
          <div *ngIf="error" class="error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <p>{{ error }}</p>
            <button class="btn-retry" (click)="loadUsers()">Try Again</button>
          </div>
          
          <div *ngIf="!loading && !error" class="users-list">
            <div *ngFor="let user of users" class="user-card">
              <div class="user-info">
                <div class="user-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="user-details">
                  <h3>{{ user.name }}</h3>
                  <p>{{ user.email }}</p>
                  <span class="role-badge" [class.admin]="user.role === 'admin'">{{ user.role }}</span>
                </div>
              </div>
              
              <div class="kogbucks-section">
                <div class="kogbucks-display">
                  <span class="kogbucks-icon">💰</span>
                  <span class="kogbucks-label">Kogbucks</span>
                </div>
                <div class="kogbucks-controls">
                  <input 
                    type="number" 
                    [value]="user.kogbucks_balance"
                    (input)="onBalanceInput($event, user)"
                    [attr.data-user-id]="user.id"
                    min="0"
                    class="balance-input"
                  />
                  <button 
                    class="btn-update" 
                    (click)="updateBalance(user)"
                    [disabled]="updatingUserId === user.id"
                    [class.saving]="updatingUserId === user.id"
                  >
                    <span *ngIf="updatingUserId !== user.id">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 3V8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Save
                    </span>
                    <span *ngIf="updatingUserId === user.id" class="saving-text">
                      Saving...
                    </span>
                  </button>
                </div>
              </div>
              
              <div *ngIf="successMessage && successUserId === user.id" class="success-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ successMessage }}
              </div>
            </div>
        </div>

        <!-- Add New User Section -->
        <div class="add-user-section">
          <h2 class="section-heading">Add New User</h2>
          <div class="add-user-form">
            <div class="form-row">
              <div class="form-field">
                <label>Name</label>
                <input type="text" [(ngModel)]="newUser.name" placeholder="Full Name" class="form-input">
              </div>
              <div class="form-field">
                <label>Email</label>
                <input type="email" [(ngModel)]="newUser.email" placeholder="email@company.com" class="form-input">
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Role</label>
                <select [(ngModel)]="newUser.role" class="form-input">
                  <option value="user">User (Sales Rep)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="form-field">
                <label>Initial Kogbucks</label>
                <input type="number" [(ngModel)]="newUser.kogbucks_balance" min="0" class="form-input">
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-add-user" (click)="addUser()" [disabled]="addingUser">
                {{ addingUser ? 'Adding...' : '+ Add User' }}
              </button>
              <p class="add-user-msg success" *ngIf="addUserSuccess">{{ addUserSuccess }}</p>
              <p class="add-user-msg error" *ngIf="addUserError">{{ addUserError }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 20px;
      color: white;
    }
    
    .admin-card {
      padding: 0;
      width: 100%;
      max-width: 700px;
      overflow: hidden;
      margin-top: 40px;
    }
    
    .admin-header {
      padding: 30px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    
    .admin-header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .admin-content {
      padding: 30px;
    }
    
    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #a855f7;
      border-radius: 50%;
      margin: 0 auto 20px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-state svg {
      color: #f87171;
      margin-bottom: 16px;
    }
    
    .btn-retry {
      margin-top: 16px;
      padding: 10px 24px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-retry:hover {
      background: rgba(99, 102, 241, 0.3);
    }
    
    .users-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .user-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
    }
    
    .user-card:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .user-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c4b5fd;
    }
    
    .user-details h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .user-details p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      color: #a5b4fc;
    }
    
    .role-badge.admin {
      background: rgba(245, 158, 11, 0.2);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }
    
    .kogbucks-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
    }
    
    .kogbucks-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .kogbucks-icon {
      font-size: 24px;
    }
    
    .kogbucks-label {
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .kogbucks-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .balance-input {
      width: 120px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      text-align: right;
      transition: all 0.3s ease;
    }
    
    .balance-input:focus {
      outline: none;
      border-color: #a855f7;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
    }
    
    .balance-input::-webkit-outer-spin-button,
    .balance-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    .btn-update {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 90px;
      justify-content: center;
    }
    
    .btn-update:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
    }
    
    .btn-update:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .btn-update.saving {
      background: linear-gradient(135deg, #4f46e5, #9333ea);
    }
    
    .saving-text {
      font-size: 13px;
    }
    
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 10px 16px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      color: #86efac;
      font-size: 14px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .add-user-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .section-heading {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .add-user-form {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 24px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field label {
      font-size: 13px;
      color: rgba(255,255,255,0.6);
    }

    .form-input {
      padding: 10px 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #a855f7;
    }

    .form-input option {
      background: #1e1b4b;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 4px;
    }

    .btn-add-user {
      padding: 10px 24px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-add-user:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-user-msg {
      font-size: 13px;
      margin: 0;
    }

    .add-user-msg.success { color: #86efac; }
    .add-user-msg.error { color: #f87171; }
  `]
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string | null = null;
  updatingUserId: number | null = null;
  successMessage: string | null = null;
  successUserId: number | null = null;

  private pendingBalances: Map<number, number> = new Map();

  // Add user
  newUser = { name: '', email: '', role: 'user', kogbucks_balance: 0 };
  addingUser = false;
  addUserSuccess: string | null = null;
  addUserError: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      this.router.navigate(['/home']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.users.filter((user: any) => user.role !== 'admin');
          // Initialize pending balances
          this.users.forEach(user => {
            this.pendingBalances.set(user.id, user.kogbucks_balance);
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  onBalanceInput(event: Event, user: User) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value) && value >= 0) {
      this.pendingBalances.set(user.id, value);
    }
  }

  updateBalance(user: User) {
    const newBalance = this.pendingBalances.get(user.id);
    if (newBalance === undefined || newBalance < 0) {
      return;
    }

    this.updatingUserId = user.id;
    this.successMessage = null;
    this.successUserId = null;

    this.userService.updateKogbucksBalance(user.id, newBalance).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local user data
          user.kogbucks_balance = newBalance;
          this.successMessage = 'Balance updated successfully!';
          this.successUserId = user.id;

          // Update current user in localStorage if updating self
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && currentUser.id === user.id) {
            currentUser.kogbucks_balance = newBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
          }

          // Clear success message after 3 seconds
          setTimeout(() => {
            if (this.successUserId === user.id) {
              this.successMessage = null;
              this.successUserId = null;
            }
          }, 3000);
        }
        this.updatingUserId = null;
      },
      error: (err) => {
        console.error('Error updating balance:', err);
        this.updatingUserId = null;
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  addUser() {
    if (!this.newUser.name || !this.newUser.email) {
      this.addUserError = 'Name and email are required.';
      return;
    }
    this.addingUser = true;
    this.addUserSuccess = null;
    this.addUserError = null;

    this.userService.createUser(this.newUser).subscribe({
      next: (res) => {
        this.addingUser = false;
        if (res.success) {
          this.addUserSuccess = `User "${res.user.name}" added successfully!`;
          this.newUser = { name: '', email: '', role: 'user', kogbucks_balance: 0 };
          this.loadUsers(); // Refresh list
          setTimeout(() => this.addUserSuccess = null, 4000);
        }
      },
      error: (err: any) => {
        this.addingUser = false;
        this.addUserError = err.error?.message || 'Failed to add user.';
      }
    });
  }
}
