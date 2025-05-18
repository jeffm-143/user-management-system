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
        } else {
            // For new employee, fetch all employees to determine next employeeId
            this.employeeService.getAll()
                .pipe(first())
                .subscribe(
                    (employees: any[]) => {
                        // Find the highest employeeId in the format EMP###
                        let maxId = 0;
                        employees.forEach(emp => {
                            const match = /^EMP(\d+)$/.exec(emp.employeeId);
                            if (match) {
                                const num = parseInt(match[1], 10);
                                if (num > maxId) maxId = num;
                            }
                        });
                        const nextId = 'EMP' + (maxId + 1).toString().padStart(3, '0');
                        this.employee.employeeId = nextId;
                    },
                    error => {
                        this.employee.employeeId = "EMP001";
                    }
                );
        }
    }
    onDepartmentChange() {
    console.log('Department selected:', this.employee.departmentId);
}

    save() {
    // validate the form
    if (!this.employee.userId || 
        !this.employee.position || !this.employee.departmentId || 
        !this.employee.hireDate || !this.employee.status) {
        this.errorMessage = 'Please fill in all required fields';
        return;
    }

    // Let the server generate employeeId if not provided
    if (!this.id && !this.employee.employeeId) {
        this.employee.employeeId = ''; // Server will generate it
    }

    if (this.id) {
        // update employee
        this.employeeService.update(this.id, this.employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/employees']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    } else {
        // create employee
        this.employeeService.create(this.employee)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/employees']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    }
}

    cancel() {
        this.router.navigate(['/admin/employees']);
    }
}