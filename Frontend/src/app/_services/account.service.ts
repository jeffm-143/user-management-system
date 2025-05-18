import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;
    private refreshTokenTimeout;
    private refreshTokenErrorCount = 0;
    private maxRefreshAttempts = 3;
    private refreshInProgress = false;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        // First stop any pending refresh timers
        this.stopRefreshTokenTimer();
        
        // Then attempt to revoke the token on the server
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
            .pipe(
                catchError(error => {
                    console.log('Error revoking token:', error);
                    return throwError(() => error);
                })
            )
            .subscribe({
                complete: () => {
                    // Continue with logout regardless of server response
                    this.accountSubject.next(null);
                    this.router.navigate(['/account/login']);
                }
            });
    }

    refreshToken() {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshInProgress) {
            return throwError(() => new Error('Refresh already in progress'));
        }

        // Reset counter if we've exceeded the max attempts
        if (this.refreshTokenErrorCount >= this.maxRefreshAttempts) {
            console.log('Max token refresh attempts reached, logging out');
            this.stopRefreshTokenTimer();
            this.logout();
            return throwError(() => new Error('Max refresh attempts reached'));
        }
        
        this.refreshInProgress = true;
        
        return this.http.post<any>(`${environment.apiUrl}/accounts/refresh-token`, {}, { withCredentials: true })
            .pipe(
                map(account => {
                    this.refreshTokenErrorCount = 0; // Reset on success
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    return account;
                }),
                catchError(error => {
                    this.refreshTokenErrorCount++;
                    console.log(`Token refresh error (${this.refreshTokenErrorCount}/${this.maxRefreshAttempts}):`, error);
                    
                    if (this.refreshTokenErrorCount >= this.maxRefreshAttempts) {
                        this.stopRefreshTokenTimer();
                        this.logout();
                    }
                    
                    return throwError(() => error);
                }),
                finalize(() => {
                    this.refreshInProgress = false; // Mark as complete regardless of success/failure
                })
            );
    }

    private stopRefreshTokenTimer() {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null; // Add this to fully clear the reference
        }
    }

    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }

    create(params: any) {
        return this.http.post(baseUrl, params);
    }

    update(id, params) {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }    

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (id === this.accountValue.id) 
                    this.logout();
            }));
    }

    // helper methods
    private startRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        
        // Make sure we're not setting an immediate or negative timeout
        const safeTimeout = Math.max(timeout, 5 * 60 * 1000); // Minimum 5 minutes
        
        console.log(`Token refresh scheduled in ${Math.round(safeTimeout/1000)} seconds`);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), safeTimeout);
    }

    // Add a method to clean up tokens when needed
    cleanupTokens() {
        return this.http.post<any>(`${baseUrl}/cleanup-tokens`, {}, { withCredentials: true });
    }
}