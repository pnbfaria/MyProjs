import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../core/models/shd.models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Clients</h1>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-item active">Tous les clients</button>
        <button class="tab-item">Nouveaux clients</button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input type="text" placeholder="Rechercher" class="filter-input filter-search" />
        <select class="filter-input filter-select"><option>Tous les feedbacks</option></select>
        <select class="filter-input filter-select"><option>Tous les statuts</option></select>
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
            <th>Nom du client</th>
            <th>Total des feedbacks reçus</th>
            <th>Feedbacks ouverts</th>
            <th>OrgUnit(s) visée(s)</th>
            <th>Tâches terminées</th>
            <th>Période d'introduction</th>
            <th style="width: 32px"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clients">
            <td><input type="checkbox" /></td>
            <td>
              <div class="client-name-cell">
                <span class="client-name">{{c.lastName}} {{c.firstName}}</span>
                <span class="client-alert-badges" *ngIf="c.terminationThreatCount > 0">
                  <span class="alert-icon-x">⊘</span>
                  <span class="alert-count">{{c.terminationThreatCount}}!</span>
                </span>
              </div>
            </td>
            <td>
              <div class="feedback-badges-row">
                <span class="fb-count-circle green">{{getTotalFb(c)}}</span>
                <span class="fb-count-circle orange" *ngIf="getOpenFb(c)">{{getOpenFb(c)}}</span>
              </div>
            </td>
            <td>{{getOpenFb(c)}}</td>
            <td>
              <span class="orgunit-link">CAS Clervaux</span>
              <span class="orgunit-extra" *ngIf="c.terminationThreatCount > 1"> +1</span>
            </td>
            <td>
              <div class="task-progress" *ngIf="getTaskInfo(c) as ti">
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="ti.pct"></div>
                </div>
                <span class="progress-label">{{ti.done}}/{{ti.total}} tâches ({{ti.pct}}%)</span>
              </div>
            </td>
            <td class="date-range">{{$any(c).createdAt | date:'dd/MM/yyyy'}} - {{$any(c).updatedAt | date:'dd/MM/yyyy'}}</td>
            <td><button class="menu-btn">⋮</button></td>
          </tr>
          <tr *ngIf="!clients.length">
            <td colspan="8" class="empty-row">Aucun client trouvé.</td>
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
    .client-name-cell { display: flex; align-items: center; gap: 6px; }
    .client-name { font-weight: 500; }
    .client-alert-badges { display: inline-flex; align-items: center; gap: 2px; }
    .alert-icon-x { color: #dc2626; font-size: 14px; }
    .alert-count { color: #dc2626; font-size: 12px; font-weight: 700; }

    .feedback-badges-row { display: flex; gap: 4px; }
    .fb-count-circle {
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600;
    }
    .fb-count-circle.green { background: #dcfce7; color: #166534; }
    .fb-count-circle.orange { background: #fed7aa; color: #9a3412; }

    .orgunit-link { text-decoration: underline; color: #2563eb; cursor: pointer; }
    .orgunit-extra { font-size: 12px; color: #2563eb; font-weight: 500; margin-left: 4px; }

    .task-progress { display: flex; flex-direction: column; gap: 4px; min-width: 100px; }
    .progress-track { height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #2563eb; border-radius: 3px; }
    .progress-label { font-size: 11px; color: #6b7280; }

    .date-range { font-size: 13px; color: #6b7280; }
    .menu-btn { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
    .empty-row { text-align: center; padding: 48px !important; color: #9ca3af; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Client[]>('http://localhost:5034/api/clients').subscribe(data => this.clients = data);
  }

  getTotalFb(c: Client): number {
    return c.feedbacks?.length || 0;
  }

  getOpenFb(c: Client): number {
    return c.feedbacks?.filter(f => f.status?.label?.toLowerCase().includes('cours') || f.status?.label?.toLowerCase().includes('attente')).length || 0;
  }

  getTaskInfo(c: Client): { done: number; total: number; pct: number } | null {
    const allTasks = c.feedbacks?.flatMap(f => f.tasks || []) || [];
    if (!allTasks.length) return null;
    const done = allTasks.filter(t => t.status?.label?.toLowerCase().includes('terminé')).length;
    return { done, total: allTasks.length, pct: Math.round((done / allTasks.length) * 100) };
  }
}
