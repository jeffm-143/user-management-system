import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { EmployeeService, AccountService, DepartmentService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    employees: any[] = [];
    departments: any[] = [];
    selectedEmployee: any = null;
    selectedDepartmentId: string = '';
    showTransferModal = false;
    errorMessage: string = '';

    constructor(
        private employeeService: EmployeeService,
        private accountService: AccountService,
        private departmentService: DepartmentService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.loadEmployees();
        this.loadDepartments();
    }

    loadEmployees() {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => {
                this.employees = employees;
            });
    }

    loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => {
                this.departments = departments;
            });
    }

    account() {
        return this.accountService.accountValue;
    }

    add() {
        this.router.navigate(['add'], { relativeTo: this.route });
    }

    edit(id: string) {
        this.router.navigate(['edit', id], { relativeTo: this.route });
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
        this.selectedEmployee = employee;
        this.selectedDepartmentId = employee.departmentId || '';
        this.errorMessage = '';
        
        // Show modal using visibility control
        console.log('Opening transfer modal for employee:', employee);
        this.showTransferModal = true;
    }

    hideModal() {
        this.showTransferModal = false;
    }

    confirmTransfer() {
    // Validate
    if (!this.selectedDepartmentId) {
        this.errorMessage = "Please select a department";
        return;
    }
    
    // Don't transfer to the same department
    if (this.selectedDepartmentId === this.selectedEmployee.departmentId) {
        this.errorMessage = "Employee is already in this department";
        return;
    }
    
    // Call API
    const params = { departmentId: parseInt(this.selectedDepartmentId) }; 
    
    this.employeeService.transfer(this.selectedEmployee.id, params)
        .pipe(first())
        .subscribe({
            next: () => {
                // Hide the modal
                this.hideModal();
                
                // Find the selected department from our departments list
                const newDepartment = this.departments.find(d => d.id === parseInt(this.selectedDepartmentId));
                
                // Update the employee in the list with the full department object
                const updatedEmployee = this.employees.find(e => e.id === this.selectedEmployee.id);
                if (updatedEmployee) {
                    updatedEmployee.departmentId = parseInt(this.selectedDepartmentId);
                    updatedEmployee.department = newDepartment; // This is the key fix
                }
                
                // Show success message
                alert('Employee transferred successfully!');
                
                // Reset
                this.selectedEmployee = null;
                this.selectedDepartmentId = '';
                this.errorMessage = '';
            },
            error: error => {
                console.error('Transfer failed:', error);
                this.errorMessage = error?.message || 'Failed to transfer employee. Please try again.';
            }
        });
}

    viewRequests(employeeId: string) {
        this.router.navigate(['/admin/requests'], { 
            queryParams: { selectedEmployeeId: employeeId }
        });
    }

    viewWorkflows(employeeId: string) {
        this.router.navigate(['/admin/workflows'], { 
            queryParams: { requesterId: employeeId }
        });
    }
    
}