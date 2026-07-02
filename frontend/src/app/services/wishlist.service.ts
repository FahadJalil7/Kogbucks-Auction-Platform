import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private storageKey = 'wishlist';
    private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
    public wishlist$ = this.wishlistSubject.asObservable();

    constructor() {
        this.loadWishlist();
    }

    private loadWishlist() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.wishlistSubject.next(JSON.parse(saved));
        }
    }

    addToWishlist(item: WishlistItem) {
        const current = this.wishlistSubject.value;
        if (!current.find(i => i.id === item.id)) {
            const updated = [...current, item];
            this.wishlistSubject.next(updated);
            this.saveWishlist(updated);
        }
    }

    removeFromWishlist(itemId: number) {
        const current = this.wishlistSubject.value;
        const updated = current.filter(item => item.id !== itemId);
        this.wishlistSubject.next(updated);
        this.saveWishlist(updated);
    }

    private saveWishlist(items: WishlistItem[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
}
