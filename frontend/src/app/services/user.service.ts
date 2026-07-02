import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    id: number;
    email: string;
    role: string;
    name: string;
    kogbucks_balance: number;
    kogbucks_on_hold: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<{ success: boolean; users: User[] }> {
        return this.http.get<{ success: boolean; users: User[] }>(`${this.apiUrl}/users`);
    }

    updateKogbucksBalance(userId: number, newBalance: number): Observable<{ success: boolean; user: User; message: string }> {
        return this.http.put<{ success: boolean; user: User; message: string }>(
            `${this.apiUrl}/users/${userId}/kogbucks`,
            { kogbucks_balance: newBalance }
        );
    }

    createUser(user: { email: string; name: string; role: string; kogbucks_balance: number }): Observable<{ success: boolean; user: User }> {
        return this.http.post<{ success: boolean; user: User }>(
            `${this.apiUrl}/users`,
            user
        );
    }
}
