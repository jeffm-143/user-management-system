import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { WorkflowService } from '@app/_services';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    workflows: any[] = [];
    employeeId?: string;

    constructor(
        private workflowService: WorkflowService,
        private accountService: AccountService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
            this.loadWorkflows();
        });
    }

    loadWorkflows() {
        if (this.employeeId) {
            // Get workflows for specific employee
            this.workflowService.getAllForEmployee(this.employeeId)
                .pipe(first())
                .subscribe(workflows => {
                    this.workflows = workflows;
                    this.setupStatusChangeTracking();
                });
        } else {
            // Get all workflows
            this.workflowService.getAll()
                .pipe(first())
                .subscribe(workflows => {
                    this.workflows = workflows;
                    this.setupStatusChangeTracking();
                });
        }
    }

    setupStatusChangeTracking() {
        // For each workflow, store original status and set up tracking
        this.workflows.forEach(workflow => {
            workflow._originalStatus = workflow.status;
            
            // We need to use defineProperty to intercept changes to status
            const self = this;
            Object.defineProperty(workflow, 'status', {
                get: function() { return this._status; },
                set: function(newStatus) {
                    const oldStatus = this._status;
                    this._status = newStatus;
                    
                    // If admin changes status via dropdown, update it on server
                    if (oldStatus !== newStatus && newStatus !== this._originalStatus) {
                        self.updateWorkflowStatus(this.id, newStatus);
                    }
                },
                enumerable: true
            });
            
            // Initialize with current status
            workflow._status = workflow.status;
        });
    }

    updateWorkflowStatus(id: string, status: string) {
        this.workflowService.updateStatus(id, status)
            .pipe(first())
            .subscribe({
                next: () => {
                    console.log(`Workflow ${id} status updated to ${status}`);
                },
                error: error => {
                    console.error('Error updating workflow status:', error);
                    // Reset to original status on error
                    const workflow = this.workflows.find(w => w.id === id);
                    if (workflow) {
                        workflow._status = workflow._originalStatus;
                    }
                }
            });
    }

    account() {
        return this.accountService.accountValue;
    }
}