import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService, AuctionEvent, AuctionItem } from '../../../services/auction.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auction-container">
      <div class="header">
        <div class="header-content">
          <button class="btn-back" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h2 class="logo">Auction Events</h2>
          
          <div class="actions">
            <!-- Sorting mostly irrelevant to events, but can keep basic or remove -->
            <button *ngIf="isAdmin()" class="btn-primary" (click)="createAuction()">+ New Auction</button>
            <div class="balance-display" *ngIf="authService.getCurrentUser() && !isAdmin()">
                Balance: <span class="balance-amount">\${{ authService.getCurrentUser()?.kogbucks_balance?.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="auction-grid">
          <div *ngFor="let au of auctions" class="auction-card glass-panel" (click)="viewDetail(au.id)">
            <!-- Use first item's image if available, else placeholder -->
            <div class="card-image" [style.backgroundImage]="'url(' + getAuctionImage(au) + ')'">
              <div class="status-badge" [ngClass]="au.status">
                {{ au.status === 'active' ? '● LIVE' : au.status === 'ended' ? 'ENDED' : 'UPCOMING' }}
              </div>
            </div>
            <div class="card-details">
              <h3>{{ au.title }}</h3>
              <div class="price-row">
                <div class="price-info">
                  <span class="value-label">{{ au.itemCount || 0 }} Items included</span>
                </div>
              </div>
              <div class="timer-row">
                <div class="countdown" *ngIf="au.status === 'active'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--theme-blue-40)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  <span class="time-left">{{ getTimeRemaining(au) }} left</span>
                </div>
                <div class="countdown ended-text" *ngIf="au.status === 'ended'">
                  <span>Auction ended</span>
                </div>
                <div class="countdown upcoming-text" *ngIf="au.status === 'upcoming'">
                  <span>Starts {{ getTimeUntilStart(au) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="auctions.length === 0" class="empty-state glass-panel">
            <h3>No auction events found.</h3>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auction-container { min-height: 100vh; color: white; padding: 20px; }
    .header-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 20px 0; }
    .logo { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #fff, #e0e7ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .actions { display: flex; gap: 15px; }
    .btn-back { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 16px; }
    .btn-primary { background: var(--accent-gradient); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .balance-display { font-size: 14px; color: #ddd; background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px; display: flex; align-items: center; gap: 6px; height: 35px; }
    .balance-amount { color: #4caf50; font-weight: bold; }
    .content { max-width: 1000px; margin: 0 auto; }
    .auction-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .auction-card { padding: 0; overflow: hidden; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; border-radius: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
    .auction-card:hover { transform: translateY(-5px); background: rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(41, 128, 185, 0.15); }
    .card-image { height: 200px; background-size: cover; background-position: center; position: relative; background-color: #2c3e50; }
    .status-badge { position: absolute; bottom: 10px; left: 10px; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .status-badge.active { background: rgba(34, 197, 94, 0.85); color: white; animation: pulse-glow 2s ease-in-out infinite; }
    .status-badge.ended { background: rgba(239, 68, 68, 0.85); color: white; }
    .status-badge.upcoming { background: rgba(234, 179, 8, 0.85); color: #1a1a1a; }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 4px rgba(34, 197, 94, 0.4); } 50% { box-shadow: 0 0 12px rgba(34, 197, 94, 0.7); } }
    .card-details { padding: 16px; }
    .card-details h3 { margin: 0 0 10px 0; font-size: 18px; }
    .price-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .price-info { display: flex; flex-direction: column; gap: 2px; }
    .value-label { font-size: 14px; color: var(--text-secondary); }
    .timer-row { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
    .countdown { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
    .time-left { color: var(--theme-blue-40); }
    .ended-text { color: #ef4444; font-size: 12px; }
    .upcoming-text { color: #eab308; font-size: 12px; }
    .empty-state { text-align: center; padding: 40px; }
  `]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  auctions: AuctionEvent[] = [];
  private timerInterval: any;

  constructor(
    private auctionService: AuctionService,
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loadAuctions();
    this.timerInterval = setInterval(() => {
      this.auctions = this.auctions.map(au => {
        const now = new Date();
        const end = new Date(au.endTime);
        const start = new Date(au.startTime);
        if (end < now) au.status = 'ended';
        else if (start > now) au.status = 'upcoming';
        else au.status = 'active';
        return { ...au };
      });
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getAuctionImage(au: AuctionEvent): string {
    if (au.items && au.items.length > 0 && au.items[0].imageUrl) {
        return au.items[0].imageUrl;
    }
    return '';
  }

  loadAuctions() {
    this.auctionService.getAuctions().subscribe(res => {
      if (res.success) {
        this.auctions = res.auctions;
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewDetail(id: number) {
    this.router.navigate(['/auctions', id]);
  }

  createAuction() {
    this.router.navigate(['/auctions/new']);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'admin';
  }

  getTimeRemaining(au: AuctionEvent): string {
    const now = new Date().getTime();
    const end = new Date(au.endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  }

  getTimeUntilStart(au: AuctionEvent): string {
    const now = new Date().getTime();
    const start = new Date(au.startTime).getTime();
    const diff = start - now;
    if (diff <= 0) return 'soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  }
}
