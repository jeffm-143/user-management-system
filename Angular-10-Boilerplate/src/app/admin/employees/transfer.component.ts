import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService, DepartmentService } from '@app/_services';

@Component({
    templateUrl: 'transfer.component.html'
})
export class TransferComponent implements OnInit {
    id: string;
    employee: any = {};
    departments: any[] = [];
    errorMessage: string = '';
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Load all departments
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
            
        // Get employee details
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe(
                employee => this.employee = employee,
                error => this.errorMessage = error
            );
    }
    
    transfer() {
        if (!this.employee.departmentId) {
            this.errorMessage = "Please select a department";
            return;
        }
        
        this.employeeService.transfer(this.id, { departmentId: this.employee.departmentId })
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