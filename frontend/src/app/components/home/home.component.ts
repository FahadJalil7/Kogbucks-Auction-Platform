import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuctionService, AuctionEvent } from '../../services/auction.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="header">
        <div class="header-content">
          <h2 class="logo">Dashboard</h2>
          <div class="header-actions">
            <button *ngIf="authService.getCurrentUser()?.role === 'admin'" class="btn-admin" (click)="goToAdmin()" title="Admin Panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Admin
            </button>
            <button *ngIf="authService.getCurrentUser()?.role === 'admin'" class="btn-reports" (click)="goToReports()" title="Admin Reports">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 20V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Reports
            </button>
            <button *ngIf="authService.getCurrentUser()?.role !== 'admin'" class="btn-wishlist" (click)="goToWishlist()" title="Wishlist">
              Wishlist
            </button>
            <button class="btn-settings" (click)="goToSettings()" title="Settings">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
        </div>
      </div>
      
      <div class="content">
        <div class="glass-panel welcome-card">
          <div class="welcome-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
              <circle cx="24" cy="20" r="6" stroke="currentColor" stroke-width="2"/>
              <path d="M12 36C12 31.5817 17.3726 28 24 28C30.6274 28 36 31.5817 36 36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Welcome Back!</h1>
          <p class="user-name">{{ authService.getCurrentUser()?.name }}</p>
          <div class="role-badge">{{ authService.getCurrentUser()?.role }}</div>
          
          <div class="stats-grid">
            <div class="stat-card" *ngIf="authService.getCurrentUser()?.role !== 'admin'">
              <div class="stat-icon">💰</div>
              <div class="stat-value">{{ (authService.getCurrentUser()?.kogbucks_balance || 0) - (authService.getCurrentUser()?.kogbucks_on_hold || 0) }}</div>
              <div class="stat-label">Available</div>
            </div>
            <div class="stat-card" *ngIf="authService.getCurrentUser()?.role !== 'admin'">
              <div class="stat-icon">⏳</div>
              <div class="stat-value">{{ authService.getCurrentUser()?.kogbucks_on_hold || 0 }}</div>
              <div class="stat-label">On Hold</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✓</div>
              <div class="stat-value">Active</div>
              <div class="stat-label">Status</div>
            </div>
            <div class="stat-card clickable-card" (click)="goToAuctions()">
              <div class="stat-icon">🏷️</div>
              <div class="stat-value">Auctions</div>
              <div class="stat-label">View Items</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔔</div>
              <div class="stat-value">{{ notificationsEnabled ? 'On' : 'Off' }}</div>
              <div class="stat-label">Notifications</div>
            </div>
          </div>
          
          <button class="btn-logout" (click)="logout()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 15L19 10L14 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Logout
          </button>
        </div>

        <!-- DASHBOARD RECORD PANELS -->
        <div class="dashboard-panels w-full">
          <!-- Live Auctions Panel -->
          <div class="glass-panel dashboard-card">
            <h2 class="panel-title">
              <span class="pulse-dot"></span>
              Live Auctions
            </h2>
            <div *ngIf="loading" class="loading-text">Loading active auctions...</div>
            <div *ngIf="!loading && liveAuctions.length === 0" class="empty-state">No live auctions right now.</div>
            
            <div class="auctions-list" *ngIf="!loading && liveAuctions.length > 0">
              <div *ngFor="let auction of liveAuctions" class="auction-item-card" (click)="goToAuctions()">
                <div class="auction-img-container">
                  <img [src]="auction.items && auction.items.length > 0 ? auction.items[0].imageUrl : 'https://via.placeholder.com/150'" [alt]="auction.title" class="auction-img">
                </div>
                <div class="auction-details">
                  <h3>{{ auction.title }}</h3>
                  
                  <div class="auction-meta">
                    <div class="time-badge">
                      <span class="meta-icon">⏱️</span>
                      <span class="meta-text">{{ formatTime(auction.endTime) }}</span>
                    </div>
                    <!-- Role-based restriction: Only Admin sees participants -->
                    <div class="participants-badge" *ngIf="authService.getCurrentUser()?.role === 'admin'">
                      <span class="meta-icon">👥</span>
                      <span class="meta-text">{{ getUniqueParticipants(auction).length }} participants</span>
                    </div>
                  </div>
                  
                  <!-- Role-based restriction: Only Admin sees avatars -->
                  <div class="participant-avatars" *ngIf="getUniqueParticipants(auction).length > 0 && authService.getCurrentUser()?.role === 'admin'">
                    <div class="avatar" *ngFor="let p of getUniqueParticipants(auction).slice(0, 3)" [title]="p">
                      {{ p.charAt(0).toUpperCase() }}
                    </div>
                    <div class="avatar more" *ngIf="getUniqueParticipants(auction).length > 3">
                      +{{ getUniqueParticipants(auction).length - 3 }}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <!-- Past Auctions Panel (Role-based restriction: Admin Only) -->
          <div class="glass-panel dashboard-card" *ngIf="authService.getCurrentUser()?.role === 'admin'">
            <h2 class="panel-title">
              <span class="icon-history">⏳</span>
              Past Auctions
            </h2>
            <div *ngIf="loading" class="loading-text">Loading history...</div>
            <div *ngIf="!loading && pastAuctions.length === 0" class="empty-state">No past auctions logged yet.</div>
            
            <div class="past-auctions-list" *ngIf="!loading && pastAuctions.length > 0">
              <div *ngFor="let auction of pastAuctions" class="past-item-row" (click)="goToAuctions()">
                <div class="past-item-info">
                  <span class="past-item-name">{{ auction.title }}</span>
                  <span class="past-item-date">{{ formatDate(auction.endTime) }}</span>
                </div>
                <div class="past-item-stats">
                  <span class="final-bid">{{ auction.itemCount || 0 }} Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  notificationsEnabled: boolean = true;
  liveAuctions: AuctionEvent[] = [];
  pastAuctions: AuctionEvent[] = [];
  loading: boolean = true;

  constructor(
    public authService: AuthService,
    private auctionService: AuctionService,
    private router: Router
  ) {
    // Load notification preference
    const savedPref = localStorage.getItem('notificationsEnabled');
    if (savedPref !== null) {
      this.notificationsEnabled = savedPref === 'true';
    }
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.auctionService.getAuctions().subscribe({
      next: (res) => {
        if (res.success) {
          const now = new Date();
          this.liveAuctions = res.auctions.filter(item => item.status === 'active' || (new Date(item.startTime) <= now && new Date(item.endTime) > now && item.status !== 'ended'));
          this.pastAuctions = res.auctions.filter(item => item.status === 'ended' || new Date(item.endTime) <= now);

          this.pastAuctions.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.loading = false;
      }
    });
  }

  getUniqueParticipants(auction: AuctionEvent): string[] {
    if (!auction || !auction.items) return [];
    let allParticipants: string[] = [];
    for (const item of auction.items) {
      if (item.bids) {
        allParticipants = allParticipants.concat(item.bids.map((b: any) => b.userName || `User ${b.userId}`).filter(Boolean));
      }
    }
    return [...new Set(allParticipants)];
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (diffMs > 0) {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let remaining = '';
      if (diffDays > 0) {
        remaining = `${diffDays}d ${diffHours}h`;
      } else if (diffHours > 0) {
        remaining = `${diffHours}h ${diffMinutes}m`;
      } else {
        remaining = `${diffMinutes}m`;
      }
      return `Ends in ${remaining} (${datePart}, ${timePart})`;
    }

    return `Ended on ${datePart}, ${timePart}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }

  goToAuctions() {
    this.router.navigate(['/auctions']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  goToReports() {
    this.router.navigate(['/admin/reports']);
  }
}
