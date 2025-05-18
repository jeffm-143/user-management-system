import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService, AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    requests: any[] = [];
    employeeId?: string;

    constructor(
        private requestService: RequestService,
        private accountService: AccountService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
            this.loadRequests();
        });
    }

    loadRequests() {
        if (this.employeeId) {
            this.requestService.getAllForEmployee(this.employeeId)
                .pipe(first())
                .subscribe(requests => this.requests = requests);
        } else {
            this.requestService.getAll()
                .pipe(first())
                .subscribe(requests => this.requests = requests);
        }
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