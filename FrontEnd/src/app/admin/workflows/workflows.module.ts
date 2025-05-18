import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WorkflowsRoutingModule } from './workflows-routing.module';
import { ListComponent } from './list.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        WorkflowsRoutingModule
    ],
    declarations: [
        ListComponent
    ]
})
export class WorkflowsModule { }