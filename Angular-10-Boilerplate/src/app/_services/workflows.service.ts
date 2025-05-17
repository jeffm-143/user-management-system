import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Workflow } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Workflow[]>(`${environment.apiUrl}/workflows`);
    }

    getAllForEmployee(employeeId: string) {
        return this.http.get<Workflow[]>(`${environment.apiUrl}/employees/${employeeId}/workflows`);
    }

    getById(id: string) {
        return this.http.get<Workflow>(`${environment.apiUrl}/workflows/${id}`);
    }

    create(workflow: any) {
        return this.http.post<Workflow>(`${environment.apiUrl}/workflows`, workflow);
    }

    update(id: string, params: any) {
        return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${id}`, params);
    }

    updateStatus(id: string, status: string) {
        return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${id}/status`, { status });
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/workflows/${id}`);
    }
}