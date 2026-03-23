import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <!-- Header row -->
      <div class="dash-header">
        <h1 class="page-title">Tableau de bord</h1>
        <div class="dash-header-right">
          <div class="notification-banner">
            <span class="banner-icon">✦</span>
            <span>Une nouvelle plainte <a class="banner-link">FB-3456</a> a été soumise</span>
            <button class="banner-close">✕</button>
          </div>
          <select class="filter-input filter-select orgunit-select">
            <option>Voir tous les OrgUnits</option>
          </select>
        </div>
      </div>

      <!-- Search bar + Nouveau feedback -->
      <div class="dash-search-row">
        <div class="search-field">
          <svg class="search-icon" width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>
          <input type="text" placeholder="Rechercher un feedback, un(e) cliente, une tâche ..." class="search-input" />
        </div>
        <div class="dropdown-wrapper">
          <button class="btn btn-black">
            Nouveau feedback
            <svg width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M8 11L3 6h10l-5 5z"/></svg>
          </button>
        </div>
      </div>

      <!-- Period tabs -->
      <div class="tabs" style="margin-bottom: 24px;">
        <button class="tab-item active">Mois en cours</button>
        <button class="tab-item">Année en cours</button>
      </div>

      <!-- KPI Row: 3 chart cards + 4 stat boxes -->
      <div class="kpi-row">
        <!-- Nombre de feedbacks -->
        <div class="card kpi-card">
          <h3 class="kpi-title">Nombre de feedbacks</h3>
          <div class="kpi-main">
            <div class="kpi-chart-area">
              <svg viewBox="0 0 120 60" class="mini-line-chart">
                <polyline points="5,45 20,40 35,35 50,42 65,30 80,25 95,28 110,15" fill="none" stroke="#16a34a" stroke-width="2"/>
                <polyline points="5,50 20,48 35,44 50,46 65,38 80,35 95,30 110,22" fill="none" stroke="#ea580c" stroke-width="2" stroke-dasharray="4"/>
              </svg>
            </div>
            <div class="kpi-value-area">
              <span class="kpi-number">23</span>
              <span class="kpi-badge-positive">+10%</span>
            </div>
          </div>
          <p class="kpi-description">Hausse des plaintes au cours de ces deux dernières semaines</p>
        </div>

        <!-- Nature des feedbacks -->
        <div class="card kpi-card">
          <h3 class="kpi-title">Nature des feedbacks</h3>
          <div class="kpi-main">
            <div class="donut-container">
              <svg viewBox="0 0 80 80" class="donut-svg">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#f3f4f6" stroke-width="10"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#ea580c" stroke-width="10" stroke-dasharray="151 188" stroke-dashoffset="0" transform="rotate(-90 40 40)"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" stroke-width="10" stroke-dasharray="19 188" stroke-dashoffset="-151" transform="rotate(-90 40 40)"/>
                <circle cx="40" cy="40" r="30" fill="none" stroke="#d1d5db" stroke-width="10" stroke-dasharray="18 188" stroke-dashoffset="-170" transform="rotate(-90 40 40)"/>
              </svg>
            </div>
            <div class="kpi-value-area">
              <span class="kpi-number">80%</span>
            </div>
          </div>
          <p class="kpi-description">de plaintes liées aux soins.</p>
        </div>

        <!-- OrgUnits visées -->
        <div class="card kpi-card">
          <h3 class="kpi-title">OrgUnits visées</h3>
          <div class="orgunit-bars">
            <div class="orgunit-bar-item" *ngFor="let o of orgUnits">
              <div class="orgunit-bar-visual">
                <div class="orgunit-stacked-bar">
                  <div class="stacked-segment green" [style.width.px]="o.green * 6"></div>
                  <div class="stacked-segment orange" [style.width.px]="o.orange * 6"></div>
                </div>
              </div>
              <div class="orgunit-label">
                <span class="orgunit-counts">{{o.green}}</span>
                <span class="orgunit-counts orange-text">{{o.orange}}</span>
              </div>
              <span class="orgunit-name">{{o.name}}</span>
            </div>
          </div>
        </div>

        <!-- Status cards -->
        <div class="stat-grid">
          <div class="stat-box" *ngFor="let s of statusCards" [style.cursor]="'pointer'">
            <span class="stat-number" [style.color]="s.color">{{s.count}}</span>
            <div class="stat-label-row">
              <span class="stat-label">{{s.label}}</span>
              <span class="stat-arrow">→</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom section -->
      <div class="bottom-row">
        <!-- Tâches à venir -->
        <div class="card bottom-card">
          <div class="card-title-row">
            <h3 class="section-title">Tâches à venir</h3>
            <a class="section-link">Paramètres</a>
          </div>
          <div class="tasks-tabs">
            <button class="task-tab active">Aujourd'hui</button>
            <button class="task-tab">Cette semaine</button>
          </div>
          <div class="timeline-list">
            <div class="timeline-entry" *ngFor="let t of upcomingTasks">
              <span class="timeline-time">{{t.time}}</span>
              <div class="timeline-dot-line">
                <div class="tl-dot"></div>
                <div class="tl-line"></div>
              </div>
              <div class="timeline-card-content">
                <div class="tl-card-top">
                  <strong>{{t.title}}</strong>
                  <span class="tl-card-fb">{{t.feedback}} {{t.feedbackName}}</span>
                </div>
                <div class="tl-card-bottom">
                  <span class="tl-user">{{t.user}}</span>
                  <span class="tl-client">Cliente: {{t.client}}</span>
                  <span class="tl-orgunit">{{t.orgUnit}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mes tâches -->
        <div class="card bottom-card">
          <h3 class="section-title">Mes tâches</h3>
          <table class="data-table mes-taches-table">
            <thead>
              <tr>
                <th></th>
                <th>N°Feedback</th>
                <th>Nom de la tâche</th>
                <th>Date d'échéance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let mt of myTasks">
                <td>
                  <div class="task-checkbox" [class.completed]="mt.done">
                    <span *ngIf="mt.done">✓</span>
                  </div>
                </td>
                <td class="fb-link">{{mt.feedback}}</td>
                <td [class.task-done]="mt.done">{{mt.name}}</td>
                <td [class.due-warn]="mt.isUrgent" [class.task-done]="mt.done">{{mt.due}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
    .dash-header-right { display: flex; align-items: center; gap: 12px; }
    .notification-banner {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 24px; font-size: 13px;
    }
    .banner-icon { color: #2563eb; }
    .banner-link { font-weight: 600; color: #2563eb; text-decoration: underline; cursor: pointer; }
    .banner-close { background: none; border: none; font-size: 14px; color: #9ca3af; cursor: pointer; margin-left: 4px; }
    .orgunit-select { min-width: 180px; }

    .dash-search-row { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    .search-field { flex: 1; position: relative; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }
    .search-input { width: 100%; padding: 10px 14px 10px 40px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff; }
    .search-input:focus { outline: none; border-color: #2563eb; }

    /* KPI Row */
    .kpi-row { display: grid; grid-template-columns: 1fr 1fr 1fr 200px; gap: 16px; margin-bottom: 20px; }
    .kpi-card { padding: 20px; }
    .kpi-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
    .kpi-main { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
    .kpi-chart-area { flex: 1; }
    .mini-line-chart { width: 100%; height: 60px; }
    .kpi-value-area { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .kpi-number { font-size: 28px; font-weight: 700; }
    .kpi-badge-positive { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: #dcfce7; color: #166534; }
    .kpi-description { font-size: 12px; color: #6b7280; }

    .donut-container { width: 80px; height: 80px; }
    .donut-svg { width: 80px; height: 80px; }

    /* OrgUnit stacked bars */
    .orgunit-bars { display: flex; flex-direction: column; gap: 12px; }
    .orgunit-bar-item { display: flex; align-items: center; gap: 8px; }
    .orgunit-bar-visual { flex: 1; }
    .orgunit-stacked-bar { display: flex; height: 20px; border-radius: 4px; overflow: hidden; }
    .stacked-segment { height: 100%; }
    .stacked-segment.green { background: #16a34a; }
    .stacked-segment.orange { background: #ea580c; }
    .orgunit-label { display: flex; gap: 4px; }
    .orgunit-counts { font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .orgunit-counts.orange-text { background: #fed7aa; color: #9a3412; }
    .orgunit-name { font-size: 12px; color: #6b7280; }

    /* Stat grid (2x2) */
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat-box {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .stat-number { font-size: 24px; font-weight: 700; }
    .stat-label-row { display: flex; align-items: center; gap: 4px; }
    .stat-label { font-size: 11px; color: #6b7280; }
    .stat-arrow { font-size: 12px; color: #9ca3af; }

    /* Bottom row */
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .bottom-card { padding: 20px; }
    .card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-title { font-size: 16px; font-weight: 700; }
    .section-link { font-size: 13px; color: #6b7280; text-decoration: underline; cursor: pointer; }

    .tasks-tabs { display: flex; gap: 0; margin-bottom: 16px; }
    .task-tab { padding: 8px 16px; font-size: 13px; background: none; border: 1px solid #e5e7eb; color: #6b7280; cursor: pointer; }
    .task-tab:first-child { border-radius: 6px 0 0 6px; }
    .task-tab:last-child { border-radius: 0 6px 6px 0; }
    .task-tab.active { background: #111827; color: #fff; border-color: #111827; }

    /* Timeline */
    .timeline-list { display: flex; flex-direction: column; gap: 0; }
    .timeline-entry { display: flex; gap: 12px; padding: 12px 0; }
    .timeline-time { font-size: 13px; font-weight: 500; color: #6b7280; width: 40px; padding-top: 2px; }
    .timeline-dot-line { display: flex; flex-direction: column; align-items: center; gap: 0; }
    .tl-dot { width: 10px; height: 10px; border-radius: 50%; background: #111827; flex-shrink: 0; }
    .tl-line { width: 2px; flex: 1; background: #e5e7eb; min-height: 30px; }
    .timeline-card-content { flex: 1; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .tl-card-top { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
    .tl-card-fb { font-size: 12px; color: #6b7280; }
    .tl-card-bottom { display: flex; gap: 12px; font-size: 12px; color: #6b7280; }
    .tl-user { text-decoration: underline; }
    .tl-orgunit { color: #2563eb; text-decoration: underline; }

    /* Mes tâches */
    .mes-taches-table th { font-size: 12px; }
    .mes-taches-table td { padding: 10px 12px; font-size: 13px; }
    .fb-link { color: #111827; font-weight: 500; }
    .task-checkbox { width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
    .task-checkbox.completed { background: #16a34a; border-color: #16a34a; color: #fff; }
    .task-done { text-decoration: line-through; color: #9ca3af; }
    .due-warn { color: #dc2626; font-weight: 500; }
  `]
})
export class DashboardComponent implements OnInit {
  statusCards = [
    { label: 'En cours', count: 8, color: '#ea580c' },
    { label: 'En attente', count: 2, color: '#f59e0b' },
    { label: 'Clôturé', count: 10, color: '#16a34a' },
    { label: 'Réouvert', count: 3, color: '#dc2626' }
  ];

  orgUnits = [
    { name: 'CAS Clervaux', green: 10, orange: 2 },
    { name: 'CAS Mersch', green: 5, orange: 1 },
    { name: 'CAS Larochette', green: 2, orange: 3 }
  ];

  upcomingTasks = [
    { time: '14:00', title: 'Entretien avec la cliente', feedback: 'FB-1234', feedbackName: 'Chute', user: 'NOGUEIRA Maria', client: 'ALBERT Clara', orgUnit: 'CAS Clervaux +1' },
    { time: '15:00', title: 'Entretien avec MA', feedback: 'FB-1234', feedbackName: 'Chute', user: 'VOET Eric', client: 'ALBERT Clara', orgUnit: 'CAS Clervaux +1' }
  ];

  myTasks = [
    { feedback: 'FB-1234', name: 'Entretien avec la cliente', due: '28/05/2025 14:00', done: false, isUrgent: true },
    { feedback: 'FB-1234', name: 'Contacter la cliente', due: '27/05/2025 14:00', done: true, isUrgent: false }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardData('mois').subscribe();
  }
}
