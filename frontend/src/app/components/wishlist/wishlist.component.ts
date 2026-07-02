import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WishlistItem, WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wishlist-container">
      <div class="header">
        <div class="header-content">
          <button class="btn-back" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h2 class="logo">My Wishlist</h2>
          <div style="width: 48px"></div> <!-- Spacer for centering -->
        </div>
      </div>

      <div class="content">
        <!-- Add Item Section -->
        <div class="add-item-section glass-panel">
          <h3>Add New Item</h3>
          <div class="input-group">
            <input type="text" [(ngModel)]="newItemName" placeholder="Item Name" class="input-field" (keyup.enter)="addItem()">
            <input type="number" [(ngModel)]="newItemPrice" placeholder="Price ($)" class="input-field" (keyup.enter)="addItem()">
            <button class="btn-primary" (click)="addItem()" [disabled]="!newItemName">Add Item</button>
          </div>
        </div>

        <div *ngIf="wishlistItems.length === 0" class="empty-state glass-panel">
          <div class="empty-icon">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Add items using the form above!</p>
        </div>

        <div class="wishlist-grid">
          <div *ngFor="let item of wishlistItems" class="wishlist-item glass-panel">
            <div class="item-image">
               <div class="placeholder-img">{{ item.name.charAt(0) }}</div>
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="price">\${{ item.price }}</p>
              <p class="description">{{ item.description }}</p>
            </div>
            <button class="btn-remove" (click)="removeFromWishlist(item.id)" title="Remove">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-container {
      min-height: 100vh;
      color: white;
      padding: 20px;
    }

    .header {
      margin-bottom: 20px;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .btn-back {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      transition: color 0.3s;
    }

    .btn-back:hover {
      color: white;
    }

    .content {
      max-width: 800px;
      margin: 0 auto;
    }

    .add-item-section {
      padding: 25px;
      margin-bottom: 30px;
    }

    .add-item-section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 20px;
    }

    .input-group {
      display: flex;
      gap: 15px;
    }

    .input-field {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 16px;
    }
    
    .input-field:focus {
      outline: none;
      border-color: var(--theme-blue-40);
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-primary {
      background: var(--accent-gradient);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.2s;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      margin: 40px auto;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .wishlist-grid {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .wishlist-item {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      transition: transform 0.3s;
    }

    .wishlist-item:hover {
      transform: translateX(5px);
    }

    .item-image {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .placeholder-img {
      font-size: 24px;
      font-weight: bold;
      color: rgba(255,255,255,0.3);
    }

    .item-details {
      flex: 1;
    }

    .item-details h3 {
      font-size: 18px;
      margin: 0 0 5px 0;
    }

    .price {
      font-size: 16px;
      font-weight: 600;
      color: var(--secondary-color);
      margin: 0 0 5px 0;
    }

    .description {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .btn-remove {
      background: rgba(255,255,255,0.05);
      border: none;
      color: var(--text-secondary);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
  `]
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  newItemName: string = '';
  newItemPrice: number | null = null;

  constructor(private wishlistService: WishlistService, private router: Router) { }

  ngOnInit() {
    this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  addItem() {
    if (this.newItemName.trim()) {
      const newItem: WishlistItem = {
        id: Date.now(), // Simple ID generation
        name: this.newItemName,
        price: this.newItemPrice || 0,
        image: '',
        description: 'Added manually'
      };
      this.wishlistService.addToWishlist(newItem);
      this.newItemName = '';
      this.newItemPrice = null;
    }
  }

  removeFromWishlist(id: number) {
    this.wishlistService.removeFromWishlist(id);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
