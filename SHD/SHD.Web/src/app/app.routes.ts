import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'feedbacks', loadComponent: () => import('./features/feedbacks/feedback-list.component').then(m => m.FeedbackListComponent) },
  { path: 'feedbacks/:id', loadComponent: () => import('./features/feedbacks/feedback-detail.component').then(m => m.FeedbackDetailComponent) },
  { path: 'clients', loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent) },
  { path: 'collaborateurs', loadComponent: () => import('./features/collaborateurs/collaborateur-list.component').then(m => m.CollaborateurListComponent) },
  { path: 'reporting', loadComponent: () => import('./features/reporting/reporting.component').then(m => m.ReportingComponent) }
];
