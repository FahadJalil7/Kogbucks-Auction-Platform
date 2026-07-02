import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuctionItem {
    id: number;
    auctionId: number;
    name: string;
    description: string;
    value: number;
    startingBid: number;
    currentBid: number;
    bids: any[];
    type: 'Physical' | 'Gift Card';
    imageUrl: string;
    bidCount: number;
}

export interface AuctionEvent {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    status: 'active' | 'ended' | 'upcoming';
    items?: AuctionItem[];
    itemCount?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuctionService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    getAuctions(sortBy?: string): Observable<{ success: boolean; auctions: AuctionEvent[] }> {
        let params = new HttpParams();
        if (sortBy) {
            params = params.set('sortBy', sortBy);
        }
        return this.http.get<{ success: boolean; auctions: AuctionEvent[] }>(`${this.apiUrl}/auctions`, { params });
    }

    getAuction(id: number): Observable<{ success: boolean; auction: AuctionEvent }> {
        return this.http.get<{ success: boolean; auction: AuctionEvent }>(`${this.apiUrl}/auctions/${id}`);
    }

    createAuction(auction: any): Observable<{ success: boolean; auction: AuctionEvent }> {
        return this.http.post<{ success: boolean; auction: AuctionEvent }>(`${this.apiUrl}/auctions`, auction);
    }

    updateAuction(id: number, auction: any): Observable<{ success: boolean; auction: AuctionEvent }> {
        return this.http.put<{ success: boolean; auction: AuctionEvent }>(`${this.apiUrl}/auctions/${id}`, auction);
    }

    placeBid(id: number, amount: number, userId: number): Observable<{ success: boolean; item: AuctionItem; message: string; newBalance: number, newOnHold?: number }> {
        return this.http.post<{ success: boolean; item: AuctionItem; message: string; newBalance: number, newOnHold?: number }>(
            `${this.apiUrl}/items/${id}/bid`,
            { amount, userId }
        );
    }

    inviteUsers(auctionId: number, userIds: number[]): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(
            `${this.apiUrl}/auctions/${auctionId}/invite`,
            { userIds }
        );
    }

    getInvitations(auctionId: number): Observable<{ success: boolean; invitations: any[] }> {
        return this.http.get<{ success: boolean; invitations: any[] }>(
            `${this.apiUrl}/auctions/${auctionId}/invitations`
        );
    }
}
