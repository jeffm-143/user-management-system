import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { DepartmentService } from '@app/_services';

@Component({
    templateUrl: 'add-edit.component.html'
})
export class AddEditComponent implements OnInit {
    id?: string;
    department: any = {
        name: '',
        description: ''
    };
    errorMessage: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private departmentService: DepartmentService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        if (this.id) {
            // edit mode
            this.departmentService.getById(this.id)
                .pipe(first())
                .subscribe(
                    department => this.department = department,
                    error => this.errorMessage = error
                );
        }
    }

save() {
    // validate the form
    if (!this.department.name || !this.department.description) {
        this.errorMessage = 'Please fill in all required fields';
        return;
    }

    console.log('Saving department with data:', this.department);

    if (this.id) {
        // update department
        this.departmentService.update(this.id, this.department)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/departments']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    } else {
        // create department
        this.departmentService.create(this.department)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/departments']);
                },
                error: error => {
                    this.errorMessage = error;
                }
            });
    }
}

    cancel() {
        this.router.navigate(['/admin/departments']);
    }
}