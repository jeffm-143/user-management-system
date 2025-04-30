import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environments';
import { Account } from '@app/_models';

const baseurl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;

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

    login(username: string, password: string) {
        return this.http.post<any>(`${baseurl}/authenticate`, { username, password }, { withCredentials: true })
            .pipe(map((account: Account) => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        this.http.post<any>(`${baseurl}/revoke-token`, {}, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }
    
    refreshToken() {
        return this.http.post<any>(`${baseurl}/refresh-token`, {}, { withCredentials: true })
            .pipe(map((account) => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) {
        return this.http.post(`${baseurl}/register`, account);
    }

    verfyEmail(token: string) {
        return this.http.post(`${baseurl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseurl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseurl}/validate-reset-token`, { token });
    }    

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseurl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(`${baseurl}`);
    }

    getById(id: string) {
        return this.http.get<Account>(`${baseurl}/${id}`);
    }

    create(params) {
        return this.http.post(`${baseurl}`, params);
    }

    update(id, params) {
        return this.http.put(`${baseurl}/${id}`, params)
            .pipe(map((account:any ) => {
                // update stored account if the logged in account updated their own record
                if (account.id === this.accountValue.id) {
                    
                    account = {...this.accountValue, ...account};
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${baseurl}/${id}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account deleted their own record
                if (id === this.accountValue.id)
                    this.logout();
            }));
    }

    private refreshTokenTimeout;

    private startRefreshTokenTimer() {

        const jwtToken = JSON.parse(atob(this.accountValue.token.split('.')[1]));

        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000); 
        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken().subscribe();
        }, timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }   
}
