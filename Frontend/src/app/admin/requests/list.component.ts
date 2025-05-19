import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService, AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    requests: any[] = [];
    employeeId?: string;  // For filtering
    selectedEmployeeId?: string;  // For new request form

    constructor(
        private requestService: RequestService,
        private accountService: AccountService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId']; // Keep this for filtering if needed
            this.selectedEmployeeId = params['selectedEmployeeId']; // New parameter
            
            // Always load all requests regardless of selectedEmployeeId
            this.loadRequests();
        });
    }
    
    loadRequests() {
        // Always load all requests (no filtering)
        this.requestService.getAll()
            .pipe(first())
            .subscribe(requests => {
                console.log('Requests data:', requests);
                this.requests = requests;
            });
    }

    account() {
        return this.accountService.accountValue;
    }

    add() {
        // Pass the selectedEmployeeId to the add form if available
        if (this.selectedEmployeeId) {
            this.router.navigate(['add'], { 
                relativeTo: this.route,
                queryParams: { selectedEmployeeId: this.selectedEmployeeId }
            });
        } else {
            this.router.navigate(['add'], { relativeTo: this.route });
        }
    }

    edit(id: string) {
        this.router.navigate(['edit', id], { relativeTo: this.route });
    }

    delete(id: string) {
        if (confirm('Are you sure you want to delete this request?')) {
            this.requestService.delete(id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.requests = this.requests.filter(x => x.id !== id);
                    },
                    error: error => console.error('Error deleting request:', error)
                });
        }
    }
}