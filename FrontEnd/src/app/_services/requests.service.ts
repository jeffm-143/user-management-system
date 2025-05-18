import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { Request } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class RequestService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Request[]> {
        return this.http.get<Request[]>(`${environment.apiUrl}/requests`);
    }

    getAllForEmployee(employeeId: string) {
        return this.http.get<any[]>(`${environment.apiUrl}/requests?employeeId=${employeeId}`);
    }

    getById(id: string): Observable<Request> {
        return this.http.get<Request>(`${environment.apiUrl}/requests/${id}`);
    }

    create(request: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/requests`, request);
    }

    update(id: string, params: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}/requests/${id}`, params);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/requests/${id}`);
    }

    approve(id: string): Observable<any> {
        return this.http.put(`${environment.apiUrl}/requests/${id}/approve`, {});
    }
    
    reject(id: string): Observable<any> {
        return this.http.put(`${environment.apiUrl}/requests/${id}/reject`, {});
    }
    getRelatedWorkflows(requestId: string) {
        return this.http.get<any[]>(`${environment.apiUrl}/workflows?requestId=${requestId}`);
    }
}