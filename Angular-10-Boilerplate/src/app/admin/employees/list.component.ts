import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';


import { EmployeeService, AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    employees: any[] = [];
    transferEmployee: any;
    transferModal: any;

    constructor(
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadEmployees();
    }

    loadEmployees() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => this.employees = employees);
    }

    account() {
        return this.accountService.accountValue;
    }

    add() {
        this.router.navigate(['/admin/employees/add']);
    }

    edit(id: string) {
        this.router.navigate(['/admin/employees/edit', id]);
    }

    delete(id: string) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.employeeService.delete(id)
                .pipe(first())
                .subscribe(() => {
                    this.employees = this.employees.filter(x => x.id !== id);
                });
        }
    }

    transfer(employee: any) {
        this.router.navigate(['/admin/employees/transfer', employee.id]);
    }

    viewRequests(employeeId: string) {
        this.router.navigate(['/admin/requests'], { queryParams: { employeeId: employeeId } });
    }

    viewWorkflows(employeeId: string) {
        this.router.navigate(['/admin/workflows'], { queryParams: { employeeId: employeeId } });
    }
    
}