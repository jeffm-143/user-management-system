import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { SubNavComponent } from './subnav.component';



const routes: Routes = [

    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: OverviewComponent },
            { path: 'accounts', loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) },
            { path: 'employees', loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule) },
            { path: 'departments', loadChildren: () => import('./departments/departments.module').then(m => m.DepartmentsModule) },
            { path: 'requests', loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule) },
            { path: 'workflows', loadChildren: () => import('./workflows/workflows.module').then(m => m.WorkflowsModule) }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
    
})
export class AdminRoutingModule { }