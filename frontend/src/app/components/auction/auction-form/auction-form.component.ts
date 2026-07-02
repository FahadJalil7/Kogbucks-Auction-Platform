import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuctionService, AuctionEvent, AuctionItem } from '../../../services/auction.service';

@Component({
  selector: 'app-auction-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="form-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">Cancel</button>
        <h2>{{ isEditMode ? 'Edit Auction Event' : 'New Auction Event' }}</h2>
      </div>

      <div class="form-content glass-panel">
        <form (ngSubmit)="onSubmit()" #auctionForm="ngForm">
          
          <div class="section-title"><h3>Event Details</h3></div>
          <div class="form-group">
            <label for="title">Auction Title</label>
            <input type="text" id="title" name="title" [(ngModel)]="auction.title" required class="input-field" placeholder="e.g. Spring Blockbuster Auction">
          </div>

          <div class="row">
            <div class="form-group half">
                <label for="startTime">Start Time</label>
                <input type="datetime-local" id="startTime" name="startTime" [(ngModel)]="auction.startTime" required class="input-field">
            </div>
            <div class="form-group half">
                <label for="endTime">End Time</label>
                <input type="datetime-local" id="endTime" name="endTime" [(ngModel)]="auction.endTime" required class="input-field">
            </div>
          </div>

          <!-- Items section -->
          <div class="section-title">
            <h3>Items in this Auction</h3>
            <!-- Only allow adding items on creation for simplicity, or during edit if implemented in backend.
                 Currently the backend creates items during POST /api/auctions, but not PUT (PUT only updates auction details).
                 So we will only show item addition if NOT in edit mode, or just display them in edit mode. -->
            <button *ngIf="!isEditMode" type="button" class="btn-add-item" (click)="addItem()">+ Add Item</button>
          </div>

          <div *ngIf="isEditMode" class="info-note">
            Items cannot be added or modified in edit mode through this form.
          </div>

          <div class="items-list" *ngIf="!isEditMode">
            <div class="item-form-card" *ngFor="let item of auction.items; let i = index">
                <div class="card-header">
                    <h4>Item {{ i + 1 }}</h4>
                    <button type="button" class="btn-remove-item" (click)="removeItem(i)">Remove</button>
                </div>
                
                <div class="form-group">
                    <label>Item Name</label>
                    <input type="text" name="itemName{{i}}" [(ngModel)]="item.name" required class="input-field" placeholder="Item Name">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="itemDesc{{i}}" [(ngModel)]="item.description" rows="2" class="input-field"></textarea>
                </div>
                
                <div class="row">
                    <div class="form-group half">
                        <label>Value ($)</label>
                        <input type="number" name="itemValue{{i}}" [(ngModel)]="item.value" required class="input-field" min="0">
                    </div>
                    <div class="form-group half">
                        <label>Starting Bid ($)</label>
                        <input type="number" name="itemBid{{i}}" [(ngModel)]="item.startingBid" required class="input-field" min="0">
                    </div>
                </div>

                <div class="row">
                    <div class="form-group half">
                        <label>Item Type</label>
                        <select name="itemType{{i}}" [(ngModel)]="item.type" class="input-field">
                            <option value="Physical">Physical Item</option>
                            <option value="Gift Card">Gift Card</option>
                        </select>
                    </div>
                    <div class="form-group half">
                        <label>Image URL</label>
                        <input type="text" name="itemImage{{i}}" [(ngModel)]="item.imageUrl" class="input-field">
                    </div>
                </div>
            </div>
            
            <div *ngIf="auction.items?.length === 0" class="empty-items-msg">
                Please add at least one item to this auction event.
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="!auctionForm.form.valid || (!isEditMode && auction.items?.length === 0)">
                {{ isEditMode ? 'Save Changes' : 'Create Auction Event' }}
            </button>
          </div>

          <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; color: white; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .header h2 { margin: 0; }
    .btn-back { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
    .glass-panel { padding: 30px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    .section-title h3 { margin: 0; color: var(--theme-blue-20); }
    .form-group { margin-bottom: 20px; }
    .row { display: flex; gap: 20px; }
    .half { flex: 1; }
    label { display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 14px; }
    .input-field { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
    .input-field:focus { outline: none; border-color: var(--theme-blue-40); }
    
    .btn-add-item { background: rgba(41, 128, 185, 0.2); border: 1px solid var(--theme-blue-40); color: var(--theme-blue-20); padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; }
    .btn-add-item:hover { background: rgba(41, 128, 185, 0.4); }
    
    .item-form-card { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .card-header h4 { margin: 0; color: #cbd5e1; }
    .btn-remove-item { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 13px; }
    
    .info-note { padding: 15px; background: rgba(234, 179, 8, 0.1); color: #eab308; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 14px; }
    .empty-items-msg { padding: 20px; text-align: center; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 20px; border: 1px dashed rgba(255,255,255,0.1); }
    
    .form-actions { margin-top: 30px; }
    .btn-submit { width: 100%; padding: 14px; background: var(--accent-gradient); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .error-message { color: #f44336; text-align: center; margin-top: 15px; }
  `]
})
export class AuctionFormComponent implements OnInit {
  auction: any = {
    title: '',
    startTime: '',
    endTime: '',
    items: []
  };
  isEditMode: boolean = false;
  errorMessage: string = '';

  constructor(
    private auctionService: AuctionService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.auctionService.getAuction(id).subscribe(res => {
        if (res.success) {
          this.auction = { 
              ...res.auction,
              // Convert dates to proper input format
              startTime: this.formatForInput(res.auction.startTime),
              endTime: this.formatForInput(res.auction.endTime)
          };
        }
      });
    } else {
        // Add one empty item by default
        this.addItem();
    }
  }

  formatForInput(dateString: string): string {
      const d = new Date(dateString);
      return d.toISOString().slice(0, 16);
  }

  addItem() {
      this.auction.items.push({
          name: '',
          description: '',
          value: null,
          startingBid: null,
          type: 'Physical',
          imageUrl: ''
      });
  }

  removeItem(index: number) {
      this.auction.items.splice(index, 1);
  }

  onSubmit() {
    if (this.isEditMode) {
      this.auctionService.updateAuction(this.auction.id, {
          title: this.auction.title,
          startTime: new Date(this.auction.startTime).toISOString(),
          endTime: new Date(this.auction.endTime).toISOString()
      }).subscribe({
        next: () => this.router.navigate(['/auctions', this.auction.id]),
        error: (err) => this.errorMessage = err.message || 'Update failed'
      });
    } else {
      const payload = {
        title: this.auction.title,
        startTime: new Date(this.auction.startTime).toISOString(),
        endTime: new Date(this.auction.endTime).toISOString(),
        items: this.auction.items
      };
      
      this.auctionService.createAuction(payload).subscribe({
        next: () => this.router.navigate(['/auctions']),
        error: (err) => this.errorMessage = err.message || 'Creation failed'
      });
    }
  }

  goBack() {
    if (this.isEditMode) {
      this.router.navigate(['/auctions', this.auction.id]);
    } else {
      this.router.navigate(['/auctions']);
    }
  }
}
