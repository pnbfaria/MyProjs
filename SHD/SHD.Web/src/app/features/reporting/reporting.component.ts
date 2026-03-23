import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reporting-layout">
      <!-- Left sidebar: Filters -->
      <aside class="filter-sidebar">
        <div class="filter-header">
          <h2>Filtres</h2>
          <button class="reset-btn">↺</button>
        </div>

        <div class="filter-section">
          <label class="filter-label">Période d'introduction</label>
          <select class="form-control">
            <option>1 Mars - 31 Mai 2025</option>
          </select>
        </div>

        <div class="filter-section">
          <div class="search-field-sm">
            <svg width="14" height="14" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>
            <input type="text" placeholder="Rechercher catégorie, OrgUnit ..." class="search-input-sm" />
          </div>
          <a class="deselect-link">Tout désélectionner</a>
        </div>

        <div class="filter-section">
          <label class="filter-label">Type de feedback</label>
          <div class="filter-checkboxes">
            <label class="checkbox-row">
              <input type="checkbox" checked />
              <span class="expand-icon">▼</span>
              <span>Tous les feedbacks</span>
              <div class="bar-indicator"><div class="bar-fill full"></div></div>
              <span class="count-value">600</span>
            </label>
            <label class="checkbox-row sub">
              <input type="checkbox" checked />
              <span>Plaintes</span>
              <div class="bar-indicator"><div class="bar-fill" style="width: 70%"></div></div>
              <span class="count-value">420</span>
            </label>
            <label class="checkbox-row sub">
              <input type="checkbox" />
              <span>Félicitations</span>
              <div class="bar-indicator"><div class="bar-fill" style="width: 23%"></div></div>
              <span class="count-value">140</span>
            </label>
            <label class="checkbox-row sub">
              <input type="checkbox" />
              <span>Événements divers</span>
              <div class="bar-indicator"><div class="bar-fill" style="width: 7%"></div></div>
              <span class="count-value">40</span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <label class="filter-label">Statut</label>
          <div class="filter-checkboxes">
            <label class="checkbox-row">
              <input type="checkbox" />
              <span>en cours</span>
              <div class="bar-indicator"><div class="bar-fill blue" style="width: 24%"></div></div>
              <span class="count-value">100</span>
            </label>
            <label class="checkbox-row">
              <input type="checkbox" />
              <span>en attente</span>
              <div class="bar-indicator"><div class="bar-fill orange" style="width: 5%"></div></div>
              <span class="count-value">20</span>
            </label>
            <label class="checkbox-row">
              <input type="checkbox" />
              <span>clôturé</span>
              <div class="bar-indicator"><div class="bar-fill dark" style="width: 71%"></div></div>
              <span class="count-value">300</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Right content -->
      <main class="reporting-content">
        <div class="reporting-header">
          <h1 class="page-title">Reporting</h1>
          <span class="customize-link">⚙ Personnaliser l'affichage</span>
          <div class="header-actions">
            <button class="btn btn-outline">🕒 Historique des téléchargements</button>
            <button class="btn btn-black">Télécharger excel</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs" style="margin-bottom: 24px;">
          <button class="tab-item" [class.active]="activeReportTab === 'general'" (click)="activeReportTab = 'general'">Général</button>
          <button class="tab-item" [class.active]="activeReportTab === 'details'" (click)="activeReportTab = 'details'">Détails du traitement</button>
          <button class="tab-item" [class.active]="activeReportTab === 'experience'" (click)="activeReportTab = 'experience'">Expérience et satisfaction client</button>
          <button class="tab-item" [class.active]="activeReportTab === 'risques'" (click)="activeReportTab = 'risques'">Analyse des risques</button>
        </div>

        <!-- General section -->
        <div *ngIf="activeReportTab === 'general'">
          <div class="section-collapse">
            <svg width="16" height="16" fill="none" stroke="#111827" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <h2 class="section-heading">Général</h2>
          </div>

          <!-- Charts row -->
          <div class="charts-row">
            <!-- Nombre de plaintes donut -->
            <div class="card chart-card">
              <h3 class="chart-title">Nombre de plaintes</h3>
              <div class="donut-chart-container">
                <svg viewBox="0 0 160 160" class="donut-large">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#ea580c" stroke-width="20"/>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" stroke-width="20" stroke-dasharray="95 377" stroke-dashoffset="-270" transform="rotate(-90 80 80)"/>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#d1d5db" stroke-width="20" stroke-dasharray="12 377" stroke-dashoffset="-365" transform="rotate(-90 80 80)"/>
                  <text x="80" y="76" text-anchor="middle" class="donut-center-number">420</text>
                  <text x="80" y="92" text-anchor="middle" class="donut-center-label">Plaintes</text>
                </svg>
                <div class="donut-legend">
                  <div class="legend-item"><span class="legend-val">420</span><span class="legend-pct">71.4%</span></div>
                </div>
              </div>
            </div>

            <!-- Statut des plaintes donut -->
            <div class="card chart-card">
              <h3 class="chart-title">Statut des plaintes</h3>
              <div class="donut-chart-container">
                <svg viewBox="0 0 160 160" class="donut-large">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#111827" stroke-width="20"/>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#16a34a" stroke-width="20" stroke-dasharray="45 377" stroke-dashoffset="0" transform="rotate(-90 80 80)"/>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#ea580c" stroke-width="20" stroke-dasharray="90 377" stroke-dashoffset="-45" transform="rotate(-90 80 80)"/>
                  <text x="80" y="76" text-anchor="middle" class="donut-center-number">420</text>
                  <text x="80" y="92" text-anchor="middle" class="donut-center-label">Plaintes</text>
                </svg>
                <div class="donut-legend-vertical">
                  <div class="legend-row"><span class="legend-dot green"></span> en cours <span class="legend-count">20<br><small>4.8%</small></span></div>
                  <div class="legend-row"><span class="legend-dot orange"></span> en attente <span class="legend-count">100<br><small>23.8%</small></span></div>
                  <div class="legend-row"><span class="legend-dot dark"></span> clôture <span class="legend-count">300<br><small>71.4%</small></span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparison card -->
          <div class="card comparison-card">
            <h3 class="chart-title">Comparaison du nombre avec la période précédente</h3>
            <p class="comparison-period">Par rapport à la période <strong>1 Octobre - 31 Décembre 2024</strong></p>
            <div class="comparison-stat">
              <span class="comparison-arrow">↗</span>
              <span class="comparison-number">150</span>
            </div>
            <p class="comparison-label">Plaintes</p>
            <span class="comparison-pct positive">+55.6%</span>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .reporting-layout { display: flex; min-height: calc(100vh - 56px); }

    /* Sidebar */
    .filter-sidebar {
      width: 280px; flex-shrink: 0;
      padding: 24px; border-right: 1px solid #e5e7eb;
      background: #fff; overflow-y: auto;
    }
    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .filter-header h2 { font-size: 20px; font-weight: 700; }
    .reset-btn { background: none; border: none; font-size: 18px; color: #6b7280; cursor: pointer; }

    .filter-section { margin-bottom: 20px; }
    .filter-label { display: block; font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
    .search-field-sm { position: relative; margin-bottom: 6px; }
    .search-field-sm svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); }
    .search-input-sm { width: 100%; padding: 8px 10px 8px 32px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
    .deselect-link { font-size: 12px; color: #111827; text-decoration: underline; cursor: pointer; }

    .filter-checkboxes { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .checkbox-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #374151; cursor: pointer; }
    .checkbox-row.sub { padding-left: 24px; }
    .checkbox-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #111827; }
    .expand-icon { font-size: 10px; color: #9ca3af; }
    .bar-indicator { flex: 1; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; margin: 0 4px; }
    .bar-fill { height: 100%; background: #2563eb; border-radius: 2px; }
    .bar-fill.full { width: 100%; }
    .bar-fill.blue { background: #2563eb; }
    .bar-fill.orange { background: #ea580c; }
    .bar-fill.dark { background: #111827; }
    .count-value { font-size: 12px; font-weight: 500; color: #6b7280; min-width: 30px; text-align: right; }

    /* Content */
    .reporting-content { flex: 1; padding: 28px 40px; }
    .reporting-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .reporting-header .page-title { margin-right: auto; }
    .customize-link { font-size: 13px; color: #6b7280; cursor: pointer; }
    .header-actions { display: flex; gap: 8px; }

    .section-collapse { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .section-heading { font-size: 18px; font-weight: 700; }

    /* Charts */
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .chart-card { padding: 24px; }
    .chart-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }

    .donut-chart-container { display: flex; align-items: center; gap: 24px; }
    .donut-large { width: 160px; height: 160px; }
    .donut-center-number { font-size: 20px; font-weight: 700; fill: #111827; }
    .donut-center-label { font-size: 11px; fill: #6b7280; }

    .donut-legend { display: flex; flex-direction: column; gap: 4px; }
    .legend-item { display: flex; gap: 8px; }
    .legend-val { font-size: 16px; font-weight: 700; }
    .legend-pct { font-size: 12px; color: #6b7280; }

    .donut-legend-vertical { display: flex; flex-direction: column; gap: 12px; }
    .legend-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-dot.green { background: #16a34a; }
    .legend-dot.orange { background: #ea580c; }
    .legend-dot.dark { background: #111827; }
    .legend-count { margin-left: auto; font-size: 13px; font-weight: 600; text-align: right; }
    .legend-count small { font-weight: 400; color: #6b7280; }

    /* Comparison */
    .comparison-card { padding: 24px; text-align: center; }
    .comparison-period { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .comparison-stat { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 16px 0 4px; }
    .comparison-arrow { font-size: 20px; color: #16a34a; }
    .comparison-number { font-size: 32px; font-weight: 700; }
    .comparison-label { font-size: 14px; color: #6b7280; }
    .comparison-pct { font-size: 16px; font-weight: 700; }
    .comparison-pct.positive { color: #16a34a; }
  `]
})
export class ReportingComponent implements OnInit {
  activeReportTab = 'general';

  ngOnInit(): void {}
}
