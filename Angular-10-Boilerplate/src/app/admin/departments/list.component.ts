import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { DepartmentService } from '@app/_services';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    departments: any[] = [];

    constructor(
        private departmentService: DepartmentService,
        private accountService: AccountService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadDepartments();
    }

    loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
    }

    account() {
        return this.accountService.accountValue;
    }

    add() {
        this.router.navigate(['/admin/departments/add']);
    }

    edit(id: string) {
        this.router.navigate(['/admin/departments/edit', id]);
    }

    delete(id: string) {
        if (confirm('Are you sure you want to delete this department?')) {
            this.departmentService.delete(id)
                .pipe(first())
                .subscribe(() => {
                    this.departments = this.departments.filter(x => x.id !== id);
                });
        }
    }
}