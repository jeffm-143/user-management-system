import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Employee } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Employee[]>(`${environment.apiUrl}/employees`);
    }

    getById(id: string) {
        return this.http.get<Employee>(`${environment.apiUrl}/employees/${id}`);
    }

    getByUserId(userId: string) {
        return this.http.get<Employee>(`${environment.apiUrl}/employees/user/${userId}`);
    }

    create(employee: any) {
    return this.http.post<any>(`${environment.apiUrl}/employees`, employee);
    }

    update(id: string, params: any) {
        return this.http.put<Employee>(`${environment.apiUrl}/employees/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/employees/${id}`);
    }
    
    transfer(id: string, params: any) {
    return this.http.put(`${environment.apiUrl}/employees/${id}/transfer`, params);
    }
}