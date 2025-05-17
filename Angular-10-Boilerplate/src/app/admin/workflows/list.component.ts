import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { WorkflowService, AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    workflows: any[] = [];
    employeeId?: string;
    requesterId?: string;  // Added this property

    constructor(
        private workflowService: WorkflowService,
        private accountService: AccountService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // Get both employeeId and requesterId from query params
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
            this.requesterId = params['requesterId']; // Added this line
            this.loadWorkflows();
        });
    }

    loadWorkflows() {
        console.log('Loading workflows:', { 
            employeeId: this.employeeId, 
            requesterId: this.requesterId 
        });
        
        // Get all workflows first
        this.workflowService.getAll()
            .pipe(first())
            .subscribe({
                next: workflows => {
                    console.log('All workflows received:', workflows);
                    
                    if (this.employeeId) {
                        // Filter by employeeId (the approver)
                        this.workflows = workflows.filter(wf => 
                            wf.employeeId === this.employeeId
                        );
                    } else if (this.requesterId) {
                        // Filter by requesterId (inside the details JSON)
                        this.workflows = workflows.filter(wf => {
                            if (!wf.details) return false;
                            
                            // Parse details if it's a string
                            let details = wf.details;
                            if (typeof details === 'string') {
                                try {
                                    details = JSON.parse(details);
                                } catch (e) {
                                    console.error('Failed to parse workflow details:', e);
                                    return false;
                                }
                            }
                            
                            // Check if requesterId matches
                            return details.requesterId == this.requesterId;
                        });
                        
                        console.log('Filtered by requesterId:', this.workflows);
                    } else {
                        // No filters, show all workflows
                        this.workflows = workflows;
                    }
                    
                    // Initialize status tracking for each workflow
                    this.workflows.forEach(workflow => {
                        workflow._status = workflow.status || 'Pending';
                    });
                },
                error: error => {
                    console.error('Error loading workflows:', error);
                }
            });
    }

    // Helper method to get object keys for displaying details
    getObjectKeys(obj: any): string[] {
        if (!obj) return [];
        
        // Parse details if it's a string
        if (typeof obj === 'string') {
            try {
                obj = JSON.parse(obj);
            } catch (e) {
                console.error('Failed to parse JSON in getObjectKeys:', e);
                return [];
            }
        }
        
        return Object.keys(obj);
    }

    updateWorkflowStatus(id: string, status: string) {
        this.workflowService.updateStatus(id, status)
            .pipe(first())
            .subscribe({
                next: () => {
                    console.log(`Workflow ${id} status updated to ${status}`);
                    
                    // Update the local workflow status in the array
                    const workflow = this.workflows.find(w => w.id === id);
                    if (workflow) {
                        workflow.status = status;
                    }
                },
                error: error => {
                    console.error('Error updating workflow status:', error);
                }
            });
    }

    account() {
        return this.accountService.accountValue;
    }
}