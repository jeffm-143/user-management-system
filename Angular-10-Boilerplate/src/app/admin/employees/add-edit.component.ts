import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService, AccountService, DepartmentService } from '@app/_services';

@Component({
    templateUrl: 'add-edit.component.html'
})
export class AddEditComponent implements OnInit {
    id?: string;
    employee: any = {
        employeeId: '',
        userId: '',
        position: '',
        departmentId: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Active'
    };
    users: any[] = [];
    departments: any[] = [];
    errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load all users that can be employees
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);

        // Load all departments
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
        
        if (this.id) {
            // edit mode
            this.employeeService.getById(this.id)
                .pipe(first())
                .subscribe(
                    employee => this.employee = employee,
                    error => this.errorMessage = error
                );
        }
    }

    save() {
        // validate the form
        if (!this.employee.employeeId || !this.employee.userId || 
            !this.employee.position || !this.employee.departmentId || 
            !this.employee.hireDate || !this.employee.status) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (this.id) {
            // update employee
            this.employeeService.update(this.id, this.employee)
                .pipe(first())
                .subscribe(
                    () => {
                        this.router.navigate(['/admin/employees']);
                    },
                    error => {
                        this.errorMessage = error;
                    }
                );
        } else {
            // create employee
            this.employeeService.create(this.employee)
                .pipe(first())
                .subscribe(
                    () => {
                        this.router.navigate(['/admin/employees']);
                    },
                    error => {
                        this.errorMessage = error;
                    }
                );
        }
    }

    cancel() {
        this.router.navigate(['/admin/employees']);
    }
}