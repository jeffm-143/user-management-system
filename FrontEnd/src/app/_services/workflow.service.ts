import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(private http: HttpClient) { }

    getAll(employeeId?: string, requesterId?: string) {
        // Use query parameters for filtering
        let url = `${environment.apiUrl}/workflows`;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (employeeId) params.append('employeeId', employeeId);
        if (requesterId) params.append('requesterId', requesterId);
        
        // Add to URL if we have params
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        console.log('Calling workflow API:', url);
        return this.http.get<any[]>(url);
    }

    getById(id: string) {
        return this.http.get<any>(`${environment.apiUrl}/workflows/${id}`);
    }

    updateStatus(id: string, status: string) {
        return this.http.put(`${environment.apiUrl}/workflows/${id}/status`, { 
            status,
            updateRequest: true  
        });
    }
}