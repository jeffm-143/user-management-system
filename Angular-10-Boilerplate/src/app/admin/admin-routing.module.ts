import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubnavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

const accountsModules = () => import('./accounts/accounts.module').then(x => x.AccountsModule);

const routes: Routes = [
    { path: '', component: SubnavComponent, outlet: 'subnav' },
    {
        path: '', component: LayoutComponent, 
        children: [
            {path: '', component: OverviewComponent},
            {path: 'accounts', loadChildren: accountsModules},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }