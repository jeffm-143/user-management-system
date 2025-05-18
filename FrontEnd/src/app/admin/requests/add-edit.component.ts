import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService, AccountService, EmployeeService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: string;
    employeeId?: string;
    request: any = {
        type: 'Equipment',
        items: [],
        status: 'Pending'
    };
    errorMessage: string = '';
    currentEmployee?: Employee;
    selectedEmployee?: Employee;
    showEmployeeSelector: boolean = false;
    employeeOptions: Employee[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private accountService: AccountService,
        private employeeService: EmployeeService
    ) {}

    ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    
    // Initialize request with defaults
    this.request = {
        type: 'Equipment',
        items: [],
        status: 'Pending'
    };
    
    // Check for selected employee from query params
    this.route.queryParams.subscribe(params => {
        const selectedEmployeeId = params['selectedEmployeeId'];
        if (selectedEmployeeId) {
            console.log('Pre-filling form with employee ID:', selectedEmployeeId);
            this.request.employeeId = selectedEmployeeId;
            
            // Get employee details for display
            this.employeeService.getById(selectedEmployeeId)
                .pipe(first())
                .subscribe(employee => {
                    this.selectedEmployee = employee;
                });
        }
    });
    
    if (this.id) {
        // Edit mode - load the request
        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: request => {
                    this.request = request;
                    
                    // Convert RequestItems to items array
                    if (request.requestItems && Array.isArray(request.requestItems)) {
                        this.request.items = request.requestItems;
                    } else {
                        this.request.items = [];
                    }
                },
                error: error => this.errorMessage = error
            });
    }
    
    // Load all employees for dropdown (if employee wasn't pre-selected)
    this.loadEmployeeOptions();
    
}
    clearSelectedEmployee() {
    this.selectedEmployee = null;
    this.request.employeeId = '';
}
    loadCurrentUserEmployee() {
    console.log('Loading current user employee');
    const account = this.accountService.accountValue;
    console.log('Account:', account);
    
    if (account) {
        this.employeeService.getByUserId(account.id)
            .pipe(first())
            .subscribe({
                next: employee => {
                    console.log('Employee loaded:', employee);
                    this.currentEmployee = employee;
                    if (employee) {
                        this.request.employeeId = employee.id;
                    } else {
                        // Fallback: Show employee selector
                        this.loadEmployeeOptions();
                    }
                },
                error: error => {
                    console.error('Error loading employee:', error);
                    // Fallback: Show employee selector
                    this.loadEmployeeOptions();
                }
            });
    } else {
        // Fallback: Show employee selector  
        this.loadEmployeeOptions();
    }
}


loadEmployeeOptions() {
    this.showEmployeeSelector = true;
    this.employeeService.getAll()
        .pipe(first())
        .subscribe({
            next: employees => {
                this.employeeOptions = employees;
            },
            error: error => console.error('Error loading employees:', error)
        });
}

    addItem() {
        this.request.items.push({
            name: '',
            quantity: 1
        });
    }

    removeItem(index: number) {
        this.request.items.splice(index, 1);
    }


    save() {
    // Validate form
    if (!this.request.type || this.request.items.length === 0) {
        this.errorMessage = "Please fill in all required fields and add at least one item";
        return;
    }
    
    // Check for non-empty items
    if (this.request.items.some(item => !item.name || item.quantity < 1)) {
        this.errorMessage = "All items must have a name and a positive quantity";
        return;
    }
    
    // Make sure employeeId is set
    if (!this.request.employeeId && this.currentEmployee) {
        this.request.employeeId = this.currentEmployee.id;
    }
    
    console.log('Submitting request with items:', this.request.items);
    
    // Create a copy of the request data for submission
    const requestData = {
        ...this.request,
        items: this.request.items // Make sure items are included!
    };
    
    if (this.id) {
        // Update 
        this.requestService.update(this.id, requestData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/requests']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    } else {
        // Create
        this.requestService.create(requestData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/requests']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    }
}

    cancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
}