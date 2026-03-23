import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FeedbackService } from '../../core/services/feedback.service';
import { Feedback } from '../../core/models/shd.models';
import { FeedbackCreateComponent } from './feedback-create.component';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FeedbackCreateComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="list-header">
        <h1 class="page-title">Feedbacks</h1>
        <div class="dropdown-wrapper">
          <button class="btn btn-black" (click)="showNewDropdown = !showNewDropdown">
            Nouveau feedback
            <svg width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M8 11L3 6h10l-5 5z"/></svg>
          </button>
          <div class="dropdown-menu" *ngIf="showNewDropdown">
            <button (click)="openCreate('plainte')">Plainte</button>
            <button (click)="openCreate('evenement')">Événement</button>
            <button (click)="openCreate('felicitation')">Félicitation</button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-item active">Tous les feedbacks</button>
        <button class="tab-item">En cours</button>
        <button class="tab-item">Dépassés</button>
        <button class="tab-item">En attente</button>
        <button class="tab-item">Clôturés</button>
        <button class="tab-item">Brouillons</button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input type="text" placeholder="Rechercher" class="filter-input filter-search" />
        <select class="filter-input filter-select"><option>Tous les feedbacks</option></select>
        <select class="filter-input filter-select"><option>Tous les OrgUnits</option></select>
        <button class="btn btn-outline">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
          Trier par priorité
        </button>
      </div>

      <!-- Table -->
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px"><input type="checkbox" /></th>
            <th>N° feedback</th>
            <th>Nom du feedback</th>
            <th>Type</th>
            <th>Date de réception</th>
            <th>Concerne client(e)</th>
            <th>OrgUnit(s) visée(s)</th>
            <th>Tâches terminées</th>
            <th>Criticité</th>
            <th>Statut</th>
            <th style="width: 32px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let fb of feedbacks" class="clickable-row" [routerLink]="['/feedbacks', fb.feedbackId]">
            <td (click)="$event.stopPropagation()"><input type="checkbox" /></td>
            <td>
              <div class="fb-number-cell">
                <span class="warn-triangle" *ngIf="fb.severity && fb.severity.severityLevel >= 3">⚠</span>
                {{fb.feedbackNumber}}
              </div>
            </td>
            <td>{{fb.description | slice:0:30}}</td>
            <td><span class="type-badge" [class]="'type-' + getTypeClass(fb.type?.label)">{{fb.type?.label || '-'}}</span></td>
            <td>{{fb.receivedDate | date:'dd/MM/yyyy HH:mm'}}</td>
            <td><span class="client-link">{{fb.client?.firstName}} {{fb.client?.lastName}}</span></td>
            <td>
              <span class="orgunit-link" *ngFor="let o of fb.orgUnits?.slice(0,1)">{{o.name}}</span>
              <span class="orgunit-extra" *ngIf="fb.orgUnits && fb.orgUnits.length > 1"> +{{fb.orgUnits.length - 1}}</span>
            </td>
            <td>
              <div class="task-progress" *ngIf="fb.tasks?.length">
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="getTaskPct(fb)"></div>
                </div>
                <span class="progress-label">{{getCompletedTasks(fb)}}/{{fb.tasks?.length}} tâches ({{getTaskPct(fb)}}%)</span>
              </div>
            </td>
            <td>
              <span class="crit-badge" [class]="'crit-' + getCritClass(fb.severity?.label)">{{fb.severity?.label || '-'}}
                <span class="crit-icons" *ngIf="fb.severity && fb.severity.severityLevel >= 3">
                  <span class="crit-icon-x">⊘</span><span class="crit-icon-warn">!</span>
                </span>
              </span>
            </td>
            <td>
              <div class="status-cell">
                <span class="status-text" [class]="'status-' + getStatusClass(fb.status?.label)">{{fb.status?.label || '-'}}</span>
                <span class="status-warn" *ngIf="fb.status?.label === 'En cours'">⚠</span>
              </div>
            </td>
            <td (click)="$event.stopPropagation()"><button class="menu-btn">⋮</button></td>
          </tr>
          <tr *ngIf="!feedbacks.length">
            <td colspan="11" class="empty-row">Aucun feedback trouvé.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <span class="pagination-info">1 - 4</span>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <button class="page-btn">4</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>

    <app-feedback-create *ngIf="showCreate" [feedbackType]="createType" (close)="showCreate = false"></app-feedback-create>
  `,
  styles: [`
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .dropdown-wrapper { position: relative; }
    .dropdown-menu {
      position: absolute; top: 100%; right: 0; margin-top: 4px;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,.1); z-index: 100; overflow: hidden; min-width: 180px;
    }
    .dropdown-menu button { display: block; width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; font-size: 14px; cursor: pointer; }
    .dropdown-menu button:hover { background: #f9fafb; }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background: #f9fafb; }

    .fb-number-cell { display: flex; align-items: center; gap: 4px; font-weight: 500; }
    .warn-triangle { color: #dc2626; font-size: 14px; }

    /* Type badges */
    .type-badge {
      display: inline-block; padding: 3px 10px; border-radius: 4px;
      font-size: 12px; font-weight: 500;
    }
    .type-plainte { background: #dcfce7; color: #166534; }
    .type-felicitation { background: #fed7aa; color: #9a3412; }
    .type-divers { background: #fef3c7; color: #92400e; }
    .type-evenement { background: #dbeafe; color: #1e40af; }

    .client-link { text-decoration: underline; color: #111827; }
    .orgunit-link { text-decoration: underline; color: #2563eb; }
    .orgunit-extra { font-size: 12px; color: #2563eb; font-weight: 500; margin-left: 4px; }

    /* Task progress */
    .task-progress { display: flex; flex-direction: column; gap: 4px; min-width: 100px; }
    .progress-track { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #2563eb; border-radius: 3px; transition: width .3s; }
    .progress-label { font-size: 11px; color: #6b7280; }

    /* Criticité badges */
    .crit-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 4px; border: 1.5px solid;
      font-size: 12px; font-weight: 600;
    }
    .crit-critique { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
    .crit-importante { border-color: #ea580c; color: #ea580c; background: #fff7ed; }
    .crit-moderee { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .crit-faible { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
    .crit-icons { display: inline-flex; gap: 2px; }
    .crit-icon-x { color: #dc2626; font-size: 13px; }
    .crit-icon-warn { color: #f59e0b; font-size: 13px; font-weight: 700; }

    /* Status */
    .status-cell { display: flex; align-items: center; gap: 4px; }
    .status-text { font-size: 13px; font-weight: 500; }
    .status-en_cours { color: #ea580c; }
    .status-en_attente { color: #2563eb; }
    .status-cloture { color: #6b7280; }
    .status-brouillon { color: #9ca3af; }
    .status-warn { color: #ea580c; font-size: 14px; }

    .menu-btn { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
    .empty-row { text-align: center; padding: 48px !important; color: #9ca3af; }
  `]
})
export class FeedbackListComponent implements OnInit {
  feedbacks: Feedback[] = [];
  showNewDropdown = false;
  showCreate = false;
  createType = 'plainte';

  constructor(private feedbackService: FeedbackService, private router: Router) {}

  ngOnInit(): void {
    this.feedbackService.getFeedbacks().subscribe(data => this.feedbacks = data);
  }

  openCreate(type: string): void {
    this.showNewDropdown = false;
    this.createType = type;
    this.showCreate = true;
  }

  getTypeClass(label?: string): string {
    if (!label) return '';
    const l = label.toLowerCase();
    if (l.includes('plainte')) return 'plainte';
    if (l.includes('licit')) return 'felicitation';
    if (l.includes('nement')) return 'evenement';
    return 'divers';
  }

  getCritClass(label?: string): string {
    if (!label) return '';
    const l = label.toLowerCase();
    if (l.includes('crit')) return 'critique';
    if (l.includes('import')) return 'importante';
    if (l.includes('mod')) return 'moderee';
    return 'faible';
  }

  getStatusClass(label?: string): string {
    if (!label) return '';
    const l = label.toLowerCase().replace(/\s/g, '_');
    if (l.includes('cours')) return 'en_cours';
    if (l.includes('attente')) return 'en_attente';
    if (l.includes('clot') || l.includes('clôt')) return 'cloture';
    return 'brouillon';
  }

  getCompletedTasks(fb: Feedback): number {
    return fb.tasks?.filter(t => t.status?.label?.toLowerCase().includes('terminé')).length || 0;
  }

  getTaskPct(fb: Feedback): number {
    if (!fb.tasks?.length) return 0;
    return Math.round((this.getCompletedTasks(fb) / fb.tasks.length) * 100);
  }
}
