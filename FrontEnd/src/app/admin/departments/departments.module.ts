import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DepartmentsRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent
    ]
})
export class DepartmentsModule { }