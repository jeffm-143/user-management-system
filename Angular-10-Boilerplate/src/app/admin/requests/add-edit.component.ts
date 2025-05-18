import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService, AccountService, EmployeeService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    id?: string;
    request: any = {
        type: 'Equipment',
        items: [],
        status: 'Pending'
    };
    errorMessage: string = '';
    currentEmployee?: Employee;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private accountService: AccountService,
        private employeeService: EmployeeService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        // Get current user's employee record if creating new request
        if (!this.id) {
            this.loadCurrentUserEmployee();
        }
        
        if (this.id) {
            // Edit mode
            this.requestService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: request => {
                        this.request = request;
                        // Map requestItems to items for form consistency
                        if (this.request.requestItems && !this.request.items) {
                            this.request.items = this.request.requestItems;
                        }
                        // Ensure items array exists
                        if (!this.request.items) {
                            this.request.items = [];
                        }
                    },
                    error: error => this.errorMessage = error
                });
        } else {
            // Add mode - initialize with empty item
            this.addItem();
        }
    }
    
    loadCurrentUserEmployee() {
        const account = this.accountService.accountValue;
        if (account) {
            this.employeeService.getByUserId(account.id)
                .pipe(first())
                .subscribe({
                    next: employee => {
                        this.currentEmployee = employee;
                        if (employee) {
                            this.request.employeeId = employee.id;
                        }
                    },
                    error: error => console.error('Error loading employee:', error)
                });
        }
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

        // Check for empty item names
        if (this.request.items.some(item => !item.name || item.quantity < 1)) {
            this.errorMessage = "All items must have a name and a positive quantity";
            return;
        }

        // Map items to requestItems for API consistency
        this.request.requestItems = this.request.items;
        
        // Make sure employee ID is set (if creating new request)
        if (!this.id && !this.request.employeeId && this.currentEmployee) {
            this.request.employeeId = this.currentEmployee.id;
        }
        
        if (this.id) {
            // Update request
            this.requestService.update(this.id, this.request)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.router.navigate(['../../'], { relativeTo: this.route });
                    },
                    error: error => {
                        this.errorMessage = error;
                    }
                });
        } else {
            // Create request
            this.requestService.create(this.request)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.router.navigate(['../'], { relativeTo: this.route });
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