import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { VotingComponent } from './pages/voting/voting.component';
import { SuccessComponent } from './pages/success/success.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'vote', component: VotingComponent },
    { path: 'success', component: SuccessComponent }
];