import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from '../../core/models/shd.models';

@Component({
  selector: 'app-collaborateur-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Collaborateurs</h1>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-item active">Tous les collaborateurs</button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input type="text" placeholder="Rechercher" class="filter-input filter-search" />
        <select class="filter-input filter-select"><option>Tous les feedbacks</option></select>
        <select class="filter-input filter-select"><option>Tous les OrgUnits</option></select>
        <button class="btn btn-outline">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
          Trier par nom (A à Z)
        </button>
      </div>

      <!-- Table -->
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32px"><input type="checkbox" /></th>
            <th>Nom du collaborateur</th>
            <th>Total des feedbacks impliqués</th>
            <th>OrgUnit(s)</th>
            <th>Période d'introduction</th>
            <th style="width: 32px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of collaborateurs">
            <td><input type="checkbox" /></td>
            <td class="collab-name">{{u.lastName}} {{u.firstName}}</td>
            <td>
              <div class="feedback-badges">
                <span class="fb-count-badge yellow">{{u.feedbackCount || 1}}</span>
                <span class="fb-count-badge orange" *ngIf="u.openFeedbackCount">{{u.openFeedbackCount}}</span>
              </div>
            </td>
            <td>
              <span class="link-text">{{u.orgUnit?.name || 'CAS Clervaux'}}</span>
              <span class="org-extra" *ngIf="u.extraOrgs"> +{{u.extraOrgs}}</span>
            </td>
            <td class="date-range">{{u.periodStart || '20/04/2024'}} - {{u.periodEnd || '26/05/2025'}}</td>
            <td><button class="menu-btn">⋮</button></td>
          </tr>
          <tr *ngIf="!collaborateurs.length">
            <td colspan="6" class="empty-cell">Aucun collaborateur trouvé.</td>
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
  `,
  styles: [`
    .collab-name { font-weight: 500; }
    .feedback-badges { display: flex; gap: 4px; }
    .fb-count-badge {
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    }
    .fb-count-badge.yellow { background: #fef3c7; color: #92400e; }
    .fb-count-badge.orange { background: #fed7aa; color: #9a3412; }

    .link-text { text-decoration: underline; cursor: pointer; }
    .org-extra { font-size: 12px; color: #2563eb; margin-left: 4px; }
    .date-range { font-size: 13px; color: #6b7280; }
    .menu-btn { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
    .empty-cell { text-align: center; padding: 48px !important; color: #9ca3af; }
  `]
})
export class CollaborateurListComponent implements OnInit {
  collaborateurs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>('http://localhost:5034/api/users').subscribe(
      data => {
        this.collaborateurs = data.map(u => ({
          ...u,
          feedbackCount: Math.floor(Math.random() * 4) + 1,
          openFeedbackCount: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
          extraOrgs: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0,
          periodStart: '20/04/2024',
          periodEnd: '26/05/2025'
        }));
      }
    );
  }
}
