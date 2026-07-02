import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-admin-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="reports-container">
      <div class="glass-panel reports-card">
        <div class="reports-header">
          <button class="btn-back" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <h1>Admin Reports</h1>
          <p class="subtitle">Real-time auction insights & analytics</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn" [class.active]="activeTab === 'bids'" (click)="activeTab = 'bids'">
            <span class="tab-icon">📊</span>
            Real-Time Bids
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'sales'" (click)="activeTab = 'sales'">
            <span class="tab-icon">🏆</span>
            Final Sale Reports
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'power'" (click)="activeTab = 'power'">
            <span class="tab-icon">💪</span>
            Bidding Power
          </button>
        </div>

        <div class="reports-content">
          <!-- Loading -->
          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading reports...</p>
          </div>

          <!-- Error -->
          <div *ngIf="error" class="error-state">
            <p>{{ error }}</p>
          </div>

          <!-- REAL-TIME BIDS TAB -->
          <div *ngIf="!loading && !error && activeTab === 'bids'" class="tab-content">
            <div class="tab-toolbar">
              <h2>All Auction Items & Bids</h2>
              <button class="btn-refresh" (click)="loadReports()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            <div *ngIf="realTimeBids.length === 0" class="empty-tab">
              <div class="empty-icon">📭</div>
              <p>No auction items found.</p>
            </div>

            <div *ngIf="realTimeBids.length > 0" class="report-table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Auction</th>
                    <th>Status</th>
                    <th>Starting Bid</th>
                    <th>Current Bid</th>
                    <th>Bids</th>
                    <th>Latest Bidder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of realTimeBids">
                    <td>{{ item.itemName }}</td>
                    <td>{{ item.auctionTitle }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="item.status">{{ item.status }}</span>
                    </td>
                    <td>{{ item.startingBid }} KB</td>
                    <td>
                      <span [class.bid-amount]="item.bidCount > 0" [class.no-bids]="item.bidCount === 0">
                        {{ item.bidCount > 0 ? item.currentBid + ' KB' : 'No bids' }}
                      </span>
                    </td>
                    <td>{{ item.bidCount }}</td>
                    <td>{{ item.latestBidderName }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- FINAL SALE REPORTS TAB -->
          <div *ngIf="!loading && !error && activeTab === 'sales'" class="tab-content">
            <div class="tab-toolbar">
              <h2>Completed Auction Sales</h2>
              <button class="btn-refresh" (click)="loadReports()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            <div *ngIf="finalSaleReports.length === 0" class="empty-tab">
              <div class="empty-icon">📋</div>
              <p>No completed sales yet.</p>
            </div>

            <div *ngIf="finalSaleReports.length > 0" class="report-table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Auction</th>
                    <th>Type</th>
                    <th>Starting Bid</th>
                    <th>Final Bid</th>
                    <th>Winner</th>
                    <th>Ended</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of finalSaleReports">
                    <td>{{ sale.itemName }}</td>
                    <td>{{ sale.auctionTitle }}</td>
                    <td>{{ sale.type }}</td>
                    <td>{{ sale.startingBid }} KB</td>
                    <td>
                      <span [class.bid-amount]="sale.finalBid" [class.no-bids]="!sale.finalBid">
                        {{ sale.finalBid ? sale.finalBid + ' KB' : 'No bids' }}
                      </span>
                    </td>
                    <td>
                      <span [class.winner-name]="sale.winnerName !== 'No bids'">{{ sale.winnerName }}</span>
                    </td>
                    <td>{{ formatDate(sale.endTime) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- BIDDING POWER TAB -->
          <div *ngIf="!loading && !error && activeTab === 'power'" class="tab-content">
            <div class="tab-toolbar">
              <h2>Reps Sorted by Bidding Power</h2>
              <button class="btn-refresh" (click)="loadReports()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            <div *ngIf="biddingPower.length === 0" class="empty-tab">
              <div class="empty-icon">👤</div>
              <p>No reps found.</p>
            </div>

            <div *ngIf="biddingPower.length > 0" class="report-table-wrapper">
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th class="sortable" (click)="toggleSort('balance')">
                      Balance
                      <span class="sort-arrow" *ngIf="sortField === 'balance'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th>On Hold</th>
                    <th class="sortable" (click)="toggleSort('total')">
                      Total KB
                      <span class="sort-arrow" *ngIf="sortField === 'total'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th class="sortable" (click)="toggleSort('bids')">
                      Bids Placed
                      <span class="sort-arrow" *ngIf="sortField === 'bids'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th>Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of sortedBiddingPower; let i = index">
                    <td>
                      <span class="rank-badge" [class.gold]="i === 0">{{ i + 1 }}</span>
                    </td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.kogbucks_balance }} KB</td>
                    <td>{{ user.kogbucks_on_hold }} KB</td>
                    <td>
                      <span class="bid-amount">{{ user.totalKogbucks }} KB</span>
                    </td>
                    <td>{{ user.totalBids }}</td>
                    <td>{{ user.totalSpent }} KB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent implements OnInit {
    activeTab: 'bids' | 'sales' | 'power' = 'bids';
    loading = true;
    error: string | null = null;

    realTimeBids: any[] = [];
    finalSaleReports: any[] = [];
    biddingPower: any[] = [];

    sortField: string = 'total';
    sortDir: 'asc' | 'desc' = 'desc';

    private apiUrl = 'http://localhost:3000/api';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            this.router.navigate(['/home']);
            return;
        }
        this.loadReports();
    }

    loadReports() {
        this.loading = true;
        this.error = null;

        this.http.get<any>(`${this.apiUrl}/admin/reports`).subscribe({
            next: (res) => {
                if (res.success) {
                    this.realTimeBids = res.realTimeBids;
                    this.finalSaleReports = res.finalSaleReports;
                    this.biddingPower = res.biddingPower;
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load reports. Please try again.';
                this.loading = false;
                console.error('Error loading reports:', err);
            }
        });
    }

    get sortedBiddingPower(): any[] {
        const data = [...this.biddingPower];
        const dir = this.sortDir === 'asc' ? 1 : -1;
        switch (this.sortField) {
            case 'balance':
                return data.sort((a, b) => (a.kogbucks_balance - b.kogbucks_balance) * dir);
            case 'total':
                return data.sort((a, b) => (a.totalKogbucks - b.totalKogbucks) * dir);
            case 'bids':
                return data.sort((a, b) => (a.totalBids - b.totalBids) * dir);
            default:
                return data;
        }
    }

    toggleSort(field: string) {
        if (this.sortField === field) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDir = 'desc';
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    goBack() {
        this.router.navigate(['/home']);
    }
}
