import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FeedbackService } from '../../core/services/feedback.service';
import { ReferenceService } from '../../core/services/reference.service';
import { Feedback, Comment, Document, Task, User, OrgUnit, RefStatus } from '../../core/models/shd.models';

@Component({
  selector: 'app-feedback-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" *ngIf="feedback">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/feedbacks" class="breadcrumb-link">Gestion des feedbacks</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{feedback.feedbackNumber}}: {{feedbackTitle}}</span>
      </div>

      <!-- Title row -->
      <div class="detail-title-row">
        <h1 class="page-title">{{feedback.feedbackNumber}}: {{feedbackTitle}}</h1>
        <button class="icon-btn-edit">✏️</button>
        <span class="priority-arrows" *ngIf="feedback.severity">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ea580c" stroke="#ea580c" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </span>
        <div class="alert-badge" *ngIf="alertCount > 0">
          <svg width="16" height="16" fill="none" stroke="#6b7280" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
          {{alertCount}} alerte{{alertCount > 1 ? 's' : ''}}
        </div>
      </div>

      <!-- Action buttons row -->
      <div class="actions-bar">
        <div class="actions-left">
          <button class="btn btn-outline">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            Ajouter Annexe
          </button>
          <button class="btn btn-outline" (click)="showCreateTaskModal = true">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Créer Tâche
          </button>
          <button class="btn btn-outline" (click)="showCommentModal = true">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Ajouter Commentaire
          </button>
        </div>
        <div class="actions-right">
          <span class="status-badge-text" [style.color]="getStatusColor(feedback.status?.label)">{{feedback.status?.label || 'brouillon'}}</span>
          <button class="btn btn-primary-dark">Clôturer la plainte</button>
          <button class="icon-btn-sm" title="Imprimer">🖨️</button>
          <button class="icon-btn-sm" title="Historique">🔄</button>
          <button class="icon-btn-sm" title="Supprimer">🗑️</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="detail-tabs">
        <div class="tabs-left">
          <button class="tab-item" [class.active]="activeTab === 'info'" (click)="activeTab = 'info'">Informations générales</button>
          <button class="tab-item" [class.active]="activeTab === 'echanges'" (click)="activeTab = 'echanges'">Échanges</button>
          <button class="tab-item" [class.active]="activeTab === 'taches'" (click)="activeTab = 'taches'">
            Tâches <span class="tab-badge" *ngIf="tasks.length">{{tasks.length}}</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'commentaires'" (click)="activeTab = 'commentaires'">Commentaires</button>
        </div>
        <span class="last-modified-label">Dernière modification le {{feedback.updatedAt | date:'dd/MM'}} à {{feedback.updatedAt | date:'HH:mm'}} par NOGUEIRA Maria</span>
      </div>

      <!-- ═══════════ Info Tab ═══════════ -->
      <div *ngIf="activeTab === 'info'" class="info-tab-content">
        <!-- Timeline card -->
        <div class="card timeline-card">
          <div class="timeline-row">
            <!-- Reception -->
            <div class="tl-column">
              <div class="tl-date">{{feedback.receivedDate | date:'dd MMM yyyy HH:mm'}}</div>
              <div class="tl-node-container"><div class="tl-node completed">✓</div></div>
              <div class="tl-info">
                <strong>Date de réception</strong>
                <span class="tl-sublabel">{{feedback.channel?.label || '-'}}</span>
                <span class="tl-sublabel" *ngIf="feedback.client">✓ {{feedback.client.lastName}} {{feedback.client.firstName}}</span>
              </div>
            </div>

            <div class="tl-segment filled"></div>

            <!-- Creation -->
            <div class="tl-column">
              <div class="tl-date">{{feedback.updatedAt | date:'dd MMM'}}</div>
              <div class="tl-node-container"><div class="tl-node completed">✓</div></div>
              <div class="tl-info">
                <strong>Date de création</strong>
                <span class="tl-sublabel">NOGUEIRA Maria</span>
              </div>
            </div>

            <div class="tl-segment filled"></div>

            <!-- Tasks in timeline -->
            <ng-container *ngFor="let t of tasks; let i = index">
              <div class="tl-column">
                <div class="tl-date">
                  {{t.dueDate | date:'dd MMM'}}
                  <svg *ngIf="isTaskOverdue(t)" class="tl-warning" width="14" height="14" viewBox="0 0 24 24" fill="#ea580c" stroke="#ea580c" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div class="tl-node-container">
                  <div class="tl-node" [ngClass]="getTaskNodeClass(t)">
                    <span *ngIf="isTaskDone(t)">✓</span>
                  </div>
                </div>
                <div class="tl-info">
                  <strong>T-{{i+1}}</strong>
                  <span class="tl-sublabel">{{t.taskName | slice:0:30}}</span>
                  <span class="tl-sublabel">{{t.assignedToUser ? t.assignedToUser.lastName + ' ' + t.assignedToUser.firstName : '-'}}</span>
                </div>
              </div>
              <div class="tl-segment" *ngIf="i < tasks.length - 1"></div>
            </ng-container>
          </div>
        </div>

        <!-- Task progress -->
        <div class="task-progress-info" *ngIf="tasks.length">
          <span class="task-progress-text">{{completedTaskCount}}/{{tasks.length}} Tâches ({{taskProgressPercent}}% terminé)</span>
        </div>

        <!-- Details + People cards -->
        <div class="detail-cards-grid">
          <!-- Détails -->
          <div class="card detail-info-card">
            <div class="card-header">
              <h3>Détails</h3>
              <button class="edit-btn">✏️</button>
            </div>
            <div class="info-field">
              <span class="field-label">Type</span>
              <span class="badge-type badge-plainte">{{feedback.type?.label || 'plainte'}}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Catégorie</span>
              <span class="badge-type badge-category">{{feedback.category?.label || '-'}} <span class="info-icon">ⓘ</span></span>
            </div>
            <div class="info-field">
              <span class="field-label">Litige</span>
              <span>{{feedback.isLitigation ? 'oui' : 'non'}}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Criticité</span>
              <span class="badge-crit" [ngClass]="getCritBadgeClass()">
                {{feedback.severity?.label || '-'}}
                <span class="crit-alert" *ngIf="isCritical()">⊘!</span>
                <span class="info-icon">ⓘ</span>
              </span>
            </div>
          </div>

          <!-- Personnes concernées -->
          <div class="card detail-info-card">
            <div class="card-header">
              <h3>Personnes concernées <span class="verified-icon">☑</span></h3>
              <button class="edit-btn">✏️</button>
            </div>
            <div class="info-field">
              <span class="field-label">Concerne client(e)</span>
              <span class="client-link-area" *ngIf="feedback.client">
                <a class="link-underline">{{feedback.client.lastName}} {{feedback.client.firstName}}</a>
                <span class="client-badge mood" *ngIf="feedback.clientMoodScore">{{feedback.clientMoodScore}}</span>
                <span class="client-badge threat" *ngIf="feedback.client.terminationThreatCount">{{feedback.client.terminationThreatCount}}</span>
                <span class="threat-warning" *ngIf="feedback.client.terminationThreatCount >= 2">⊘ {{feedback.client.terminationThreatCount}} menaces de résiliation !</span>
              </span>
              <span *ngIf="!feedback.client">-</span>
            </div>
            <div class="info-field">
              <span class="field-label">Requérant(e)</span>
              <span>-</span>
            </div>
            <div class="info-field empty-spacer"></div>
            <div class="info-field">
              <span class="field-label">OrgUnit(s) visée(s)</span>
              <span class="orgunit-links">
                <a class="link-underline" *ngFor="let ou of feedback.orgUnits">{{ou.name}}</a>
                <span *ngIf="!feedback.orgUnits?.length">-</span>
              </span>
            </div>
            <div class="info-field">
              <span class="field-label">Attribué à</span>
              <span class="assigned-links">
                <a class="link-underline" *ngFor="let u of assignedUsers">{{u.lastName}} {{u.firstName}}</a>
                <span *ngIf="!assignedUsers.length">-</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Description section -->
        <div class="card description-card">
          <div class="card-header clickable" (click)="descriptionExpanded = !descriptionExpanded">
            <h3>
              <svg [class.rotated]="descriptionExpanded" class="chevron-toggle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              Description
            </h3>
            <button class="edit-btn">✏️</button>
          </div>
          <div class="description-body" *ngIf="descriptionExpanded">
            <p>{{feedback.description || 'Aucune description.'}}</p>
          </div>
        </div>
      </div>

      <!-- ═══════════ Échanges Tab ═══════════ -->
      <div *ngIf="activeTab === 'echanges'" class="tab-content">
        <div class="card">
          <div class="card-header clickable" (click)="echangesExpanded = !echangesExpanded">
            <h3>
              <svg [class.rotated]="echangesExpanded" class="chevron-toggle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              Échanges
            </h3>
            <div class="filter-row" (click)="$event.stopPropagation()">
              <select class="filter-select" [(ngModel)]="docTypeFilter">
                <option value="">Type</option>
                <option value="rapport">Rapport</option>
                <option value="mail">Mail</option>
                <option value="accusé">Accusé</option>
              </select>
              <select class="filter-select" [(ngModel)]="docStatusFilter">
                <option value="">Statut</option>
                <option value="brouillon">Brouillon</option>
                <option value="finalisé">Finalisé</option>
                <option value="envoyé">Envoyé</option>
              </select>
              <button class="btn btn-outline btn-sm">↕ Nouveaux en premier</button>
            </div>
          </div>

          <div *ngIf="echangesExpanded">
            <table class="data-table" *ngIf="documents.length; else noDocuments">
              <thead>
                <tr>
                  <th style="width:36px"><input type="checkbox" /></th>
                  <th>Type</th>
                  <th>Nom du document</th>
                  <th>Date de création</th>
                  <th>Créé par</th>
                  <th>Statut</th>
                  <th style="width:120px"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of documents">
                  <td><input type="checkbox" /></td>
                  <td>
                    <span class="doc-type-icon">{{getDocIcon(doc.docType)}}</span>
                  </td>
                  <td><a class="link-underline">{{doc.fileName}}</a></td>
                  <td>{{doc.createdAt | date:'dd/MM/yyyy HH:mm'}}</td>
                  <td>NOGUEIRA Maria</td>
                  <td><span class="doc-status" [ngClass]="'status-'+getDocStatusClass(doc)">{{getDocStatus(doc)}}</span></td>
                  <td class="action-icons">
                    <button class="icon-btn-xs" title="Voir">👁️</button>
                    <button class="icon-btn-xs" title="Télécharger">⬇️</button>
                    <button class="icon-btn-xs" title="Envoyer">➤</button>
                    <button class="icon-btn-xs" title="Supprimer">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <ng-template #noDocuments>
              <p class="empty-text">Aucun échange pour ce feedback.</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- ═══════════ Tâches Tab ═══════════ -->
      <div *ngIf="activeTab === 'taches'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h3>Tâches ({{tasks.length}})</h3>
            <button class="btn btn-outline btn-sm" (click)="showCreateTaskModal = true">+ Créer tâche</button>
          </div>
          <table class="data-table" *ngIf="tasks.length; else noTasks">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Assigné à</th>
                <th>Date de début</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of tasks">
                <td>{{t.taskName}}</td>
                <td>{{t.assignedToUser ? t.assignedToUser.lastName + ' ' + t.assignedToUser.firstName : '-'}}</td>
                <td>{{t.startDate | date:'dd/MM/yyyy'}}</td>
                <td>
                  {{t.dueDate | date:'dd/MM/yyyy'}}
                  <svg *ngIf="isTaskOverdue(t)" class="tl-warning inline-warn" width="14" height="14" viewBox="0 0 24 24" fill="#ea580c" stroke="#ea580c" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </td>
                <td><span class="task-status-badge" [ngClass]="getTaskStatusClass(t)">{{t.status?.label || 'ouverte'}}</span></td>
                <td><span *ngIf="t.isHighPriority" class="priority-high">⚡ Haute</span><span *ngIf="!t.isHighPriority">Normal</span></td>
              </tr>
            </tbody>
          </table>
          <ng-template #noTasks>
            <p class="empty-text">Aucune tâche assignée.</p>
          </ng-template>
        </div>
      </div>

      <!-- ═══════════ Commentaires Tab ═══════════ -->
      <div *ngIf="activeTab === 'commentaires'" class="tab-content">
        <div class="card">
          <div class="card-header clickable" (click)="commentairesExpanded = !commentairesExpanded">
            <h3>
              <svg [class.rotated]="commentairesExpanded" class="chevron-toggle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              Commentaire
            </h3>
            <button class="btn btn-outline btn-sm">↕ Nouveaux en premier</button>
          </div>
          <div *ngIf="commentairesExpanded">
            <div *ngIf="comments.length; else noComments">
              <div class="comment-item" *ngFor="let c of comments">
                <div class="comment-header">
                  <strong class="comment-author">{{c.authorUser ? c.authorUser.lastName + ' ' + c.authorUser.firstName : 'Utilisateur'}}</strong>
                  <span class="comment-date">a laissé un commentaire - {{c.createdAt | date:'dd/MM/yyyy HH:mm'}}</span>
                </div>
                <p class="comment-body">{{c.content}}</p>
              </div>
            </div>
            <ng-template #noComments>
              <p class="empty-text">Aucun commentaire.</p>
            </ng-template>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ Create Task Modal ═══════════ -->
    <div *ngIf="showCreateTaskModal">
      <div class="modal-backdrop" (click)="showCreateTaskModal = false"></div>
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Créer une tâche</h2>
          <button class="modal-close" (click)="showCreateTaskModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-row">
            <label class="modal-label">Nom de la tâche<span class="req">*</span></label>
            <input type="text" class="form-control" [(ngModel)]="newTask.taskName" placeholder="Nom de la tâche" />
          </div>
          <div class="modal-form-row">
            <label class="modal-label">Date de début</label>
            <input type="datetime-local" class="form-control" [(ngModel)]="newTask.startDate" />
          </div>
          <div class="modal-form-row">
            <label class="modal-label">Date d'échéance<span class="req">*</span></label>
            <input type="datetime-local" class="form-control" [(ngModel)]="newTask.dueDate" />
          </div>
          <div class="modal-form-row">
            <label class="modal-label">OrgUnit(s) visée(s)<span class="req">*</span></label>
            <select class="form-control" [(ngModel)]="taskOrgUnitId">
              <option [ngValue]="null">choisir...</option>
              <option *ngFor="let ou of orgUnits" [ngValue]="ou.orgUnitId">{{ou.name}}</option>
            </select>
          </div>
          <div class="modal-form-row">
            <label class="modal-label">Attribué à</label>
            <select class="form-control" [(ngModel)]="newTask.assignedToUserId">
              <option [ngValue]="null">choisir...</option>
              <option *ngFor="let u of filteredTaskUsers" [ngValue]="u.userId">{{u.lastName}} {{u.firstName}}</option>
            </select>
            <span class="form-hint">Seuls les membres de l'OrgUnit sélectionnée sont affichés.</span>
          </div>
          <div class="modal-form-row">
            <label class="modal-label">Etat de la tâche</label>
            <select class="form-control" [(ngModel)]="newTask.statusId">
              <option *ngFor="let s of taskStatuses" [ngValue]="s.statusId">{{s.label}}</option>
            </select>
          </div>
          <div class="modal-form-row">
            <label class="modal-label">Description</label>
            <textarea class="form-control form-textarea" [(ngModel)]="newTask.description" placeholder="écrire ici..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="showCreateTaskModal = false">Annuler</button>
          <button class="btn btn-outline">Sauvegarder le brouillon</button>
          <button class="btn btn-primary-dark" (click)="createTask()">Créer la tâche</button>
        </div>
      </div>
    </div>

    <!-- ═══════════ Add Comment Modal ═══════════ -->
    <div *ngIf="showCommentModal">
      <div class="modal-backdrop" (click)="showCommentModal = false"></div>
      <div class="modal-container modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Ajouter un commentaire</h2>
          <button class="modal-close" (click)="showCommentModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-form-row">
            <label class="modal-label">Commentaire</label>
            <textarea class="form-control form-textarea" [(ngModel)]="newCommentText" placeholder="écrire ici..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="showCommentModal = false">Annuler</button>
          <button class="btn btn-primary-dark" (click)="submitComment()">Ajouter le commentaire</button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="!feedback" class="page-container">
      <p class="loading-text">Chargement du feedback...</p>
    </div>
  `,
  styles: [`
    /* ── Breadcrumb ── */
    .breadcrumb { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    .breadcrumb-link { text-decoration: underline; color: #111827; }
    .breadcrumb-link:hover { color: #2563eb; }
    .breadcrumb-sep { margin: 0 8px; }
    .breadcrumb-current { color: #6b7280; }

    /* ── Title row ── */
    .detail-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .icon-btn-edit { background: none; border: none; font-size: 16px; cursor: pointer; }
    .priority-arrows svg { vertical-align: middle; }
    .alert-badge { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #6b7280; margin-left: 8px; }

    /* ── Actions bar ── */
    .actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
    .actions-left { display: flex; gap: 8px; }
    .actions-right { display: flex; align-items: center; gap: 10px; }
    .status-badge-text { font-size: 14px; font-weight: 600; }
    .icon-btn-sm { background: none; border: none; font-size: 16px; cursor: pointer; opacity: .5; }
    .icon-btn-sm:hover { opacity: 1; }
    .btn-primary-dark { background: #111827; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .btn-primary-dark:hover { background: #1f2937; }

    /* ── Tabs ── */
    .detail-tabs { display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px; }
    .tabs-left { display: flex; gap: 0; }
    .tab-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; border-radius: 10px; background: #111827; color: #fff; font-size: 11px; margin-left: 4px; padding: 0 6px; }
    .last-modified-label { font-size: 12px; color: #9ca3af; margin-left: auto; }

    /* ── Timeline ── */
    .timeline-card { padding: 24px; margin-bottom: 8px; }
    .timeline-row { display: flex; align-items: flex-start; gap: 0; overflow-x: auto; }
    .tl-column { display: flex; flex-direction: column; align-items: center; min-width: 110px; flex: 1; text-align: center; }
    .tl-date { font-size: 13px; font-weight: 600; margin-bottom: 8px; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .tl-warning { flex-shrink: 0; }
    .tl-node-container { display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .tl-node { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
    .tl-node.completed { background: #bbf7d0; border: 2px solid #16a34a; color: #16a34a; }
    .tl-node.pending { background: #fff; border: 2px solid #d1d5db; color: #d1d5db; }
    .tl-node.overdue { background: #fff; border: 2px solid #ea580c; color: #ea580c; }
    .tl-segment { width: 40px; height: 4px; background: #e5e7eb; flex-shrink: 0; margin-top: 40px; align-self: center; }
    .tl-segment.filled { background: #16a34a; }
    .tl-info { display: flex; flex-direction: column; gap: 2px; }
    .tl-info strong { font-size: 13px; }
    .tl-sublabel { font-size: 12px; color: #9ca3af; }

    /* ── Task progress ── */
    .task-progress-info { text-align: right; margin-bottom: 16px; }
    .task-progress-text { font-size: 13px; font-weight: 500; color: #ea580c; }

    /* ── Cards grid ── */
    .detail-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .detail-info-card { padding: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .card-header.clickable { cursor: pointer; }
    .verified-icon { color: #9ca3af; font-size: 14px; }
    .edit-btn { background: none; border: none; font-size: 14px; cursor: pointer; opacity: .4; }
    .edit-btn:hover { opacity: 1; }

    .info-field { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .info-field:last-child { border-bottom: none; }
    .empty-spacer { min-height: 20px; border: none; }
    .field-label { color: #6b7280; flex-shrink: 0; }
    .info-icon { font-size: 12px; color: #9ca3af; margin-left: 4px; cursor: pointer; }
    .link-underline { text-decoration: underline; color: #2563eb; cursor: pointer; margin-right: 10px; }

    /* Badges */
    .badge-type { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 500; }
    .badge-plainte { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .badge-category { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
    .badge-crit { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 500; border: 1px solid; }
    .badge-crit-faible { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .badge-crit-moderee { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
    .badge-crit-importante { background: #fff7ed; color: #ea580c; border-color: #fed7aa; }
    .badge-crit-critique { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .crit-alert { color: #dc2626; font-weight: 700; }

    /* Client area */
    .client-link-area { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .client-badge { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; }
    .client-badge.mood { background: #111827; color: #fff; }
    .client-badge.threat { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .threat-warning { font-size: 12px; color: #dc2626; font-weight: 500; display: flex; align-items: center; gap: 4px; }

    .orgunit-links, .assigned-links { display: flex; gap: 8px; flex-wrap: wrap; }

    /* ── Description card ── */
    .description-card { padding: 24px; margin-top: 20px; }
    .description-body { font-size: 14px; line-height: 1.7; color: #374151; padding-top: 8px; }
    .chevron-toggle { transition: transform .15s; display: inline-block; }
    .chevron-toggle.rotated { transform: rotate(180deg); }

    /* ── Data tables ── */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; font-size: 13px; color: #6b7280; font-weight: 500; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    .data-table td { font-size: 14px; padding: 12px; border-bottom: 1px solid #f3f4f6; }
    .data-table tr:hover td { background: #f9fafb; }
    .doc-type-icon { font-size: 18px; }
    .doc-status { font-size: 13px; font-weight: 500; }
    .status-brouillon { color: #ea580c; }
    .status-finalise { color: #111827; }
    .status-envoye { color: #111827; }
    .action-icons { display: flex; gap: 4px; }
    .icon-btn-xs { background: none; border: none; font-size: 14px; cursor: pointer; opacity: .5; padding: 2px; }
    .icon-btn-xs:hover { opacity: 1; }

    .filter-row { display: flex; gap: 8px; align-items: center; }
    .filter-select { padding: 6px 28px 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
    .btn-sm { font-size: 13px; padding: 6px 12px; }

    /* ── Task status badges ── */
    .task-status-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 13px; }
    .task-status-open { background: #f3f4f6; color: #374151; }
    .task-status-progress { background: #dbeafe; color: #2563eb; }
    .task-status-done { background: #dcfce7; color: #16a34a; }
    .task-status-overdue { background: #fff7ed; color: #ea580c; }
    .priority-high { color: #ea580c; font-weight: 500; }
    .inline-warn { vertical-align: middle; margin-left: 4px; }

    /* ── Comments ── */
    .comment-item { padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
    .comment-item:last-child { border-bottom: none; }
    .comment-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
    .comment-author { font-size: 14px; color: #2563eb; text-decoration: underline; cursor: pointer; }
    .comment-date { font-size: 13px; color: #6b7280; }
    .comment-body { font-size: 14px; line-height: 1.6; color: #374151; margin: 0; }

    .empty-text { color: #9ca3af; font-size: 14px; text-align: center; padding: 40px 0; }
    .loading-text { color: #9ca3af; font-size: 14px; text-align: center; padding: 60px 0; }

    /* ── Modals ── */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000; }
    .modal-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: #fff; border-radius: 12px; z-index: 1001; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-sm { width: 520px; max-height: 85vh; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 12px; }
    .modal-title { font-size: 18px; font-weight: 700; }
    .modal-close { background: none; border: none; font-size: 20px; color: #6b7280; cursor: pointer; }
    .modal-body { flex: 1; overflow-y: auto; padding: 8px 24px 16px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid #e5e7eb; }
    .modal-form-row { display: flex; align-items: flex-start; gap: 16px; padding: 10px 0; }
    .modal-label { width: 160px; font-size: 14px; color: #374151; padding-top: 8px; flex-shrink: 0; }
    .form-control { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
    .form-control:focus { outline: none; border-color: #2563eb; }
    .form-textarea { min-height: 80px; resize: vertical; }
    .form-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; flex: 1; }
    .req { color: #dc2626; }
  `]
})
export class FeedbackDetailComponent implements OnInit {
  feedback?: Feedback;
  activeTab = 'info';
  tasks: Task[] = [];
  comments: Comment[] = [];
  documents: Document[] = [];
  orgUnits: OrgUnit[] = [];
  allUsers: User[] = [];
  taskStatuses: RefStatus[] = [];
  assignedUsers: User[] = [];
  alertCount = 0;

  // Expandable sections
  descriptionExpanded = true;
  echangesExpanded = true;
  commentairesExpanded = true;

  // Filters
  docTypeFilter = '';
  docStatusFilter = '';

  // Create task modal
  showCreateTaskModal = false;
  newTask: any = { taskName: '', startDate: '', dueDate: '', assignedToUserId: null, statusId: null, description: '' };
  taskOrgUnitId: number | null = null;

  // Comment modal
  showCommentModal = false;
  newCommentText = '';

  private apiUrl = 'http://localhost:5034/api';

  constructor(
    private route: ActivatedRoute,
    private feedbackService: FeedbackService,
    private refService: ReferenceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.feedbackService.getFeedback(id).subscribe(data => {
      this.feedback = data;
      this.alertCount = data.client?.terminationThreatCount ? Math.min(data.client.terminationThreatCount, 3) : 0;
      // Build assigned users list from tasks
      if (data.tasks) {
        this.tasks = data.tasks;
        this.buildAssignedUsers();
      }
    });

    // Load tasks
    this.http.get<Task[]>(`${this.apiUrl}/tasks/feedback/${id}`).subscribe(t => {
      this.tasks = t;
      this.buildAssignedUsers();
    });

    // Load comments
    this.http.get<Comment[]>(`${this.apiUrl}/comments/feedback/${id}`).subscribe(c => this.comments = c);

    // Load documents
    this.http.get<Document[]>(`${this.apiUrl}/documents/feedback/${id}`).subscribe(d => this.documents = d);

    // Load reference data for modals
    this.refService.getOrgUnits().subscribe(o => this.orgUnits = o);
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe(u => this.allUsers = u);
    this.refService.getStatuses().subscribe(s => {
      this.taskStatuses = s.filter(st => st.appliesTo === 'TASK');
    });
  }

  get feedbackTitle(): string {
    if (!this.feedback) return '';
    const subj = this.feedback.subject?.label || this.feedback.category?.label || this.feedback.description?.slice(0, 30) || '';
    return subj;
  }

  buildAssignedUsers(): void {
    const userMap = new Map<number, User>();
    for (const t of this.tasks) {
      if (t.assignedToUser) userMap.set(t.assignedToUser.userId, t.assignedToUser);
    }
    this.assignedUsers = Array.from(userMap.values());
  }

  get filteredTaskUsers(): User[] {
    if (!this.taskOrgUnitId) return this.allUsers;
    return this.allUsers.filter(u => u.orgUnitId === this.taskOrgUnitId);
  }

  get completedTaskCount(): number {
    return this.tasks.filter(t => t.status?.label?.toLowerCase() === 'finalisée').length;
  }

  get taskProgressPercent(): number {
    if (!this.tasks.length) return 0;
    return Math.round((this.completedTaskCount / this.tasks.length) * 100);
  }

  getStatusColor(label?: string): string {
    switch (label?.toLowerCase()) {
      case 'en cours': return '#ea580c';
      case 'brouillon': return '#2563eb';
      case 'clôturé': return '#6b7280';
      default: return '#2563eb';
    }
  }

  getCritBadgeClass(): string {
    const level = this.feedback?.severity?.severityLevel ?? 1;
    if (level <= 1) return 'badge-crit-faible';
    if (level <= 2) return 'badge-crit-moderee';
    if (level <= 3) return 'badge-crit-importante';
    return 'badge-crit-critique';
  }

  isCritical(): boolean {
    return (this.feedback?.severity?.severityLevel ?? 0) >= 4;
  }

  // Timeline helpers
  isTaskOverdue(t: Task): boolean {
    if (!t.dueDate) return false;
    const label = t.status?.label?.toLowerCase() || '';
    return label === 'dépassée' || (new Date(t.dueDate) < new Date() && !this.isTaskDone(t));
  }

  isTaskDone(t: Task): boolean {
    const label = t.status?.label?.toLowerCase() || '';
    return label === 'finalisée';
  }

  getTaskNodeClass(t: Task): string {
    if (this.isTaskDone(t)) return 'completed';
    if (this.isTaskOverdue(t)) return 'overdue';
    return 'pending';
  }

  getTaskStatusClass(t: Task): string {
    const l = t.status?.label?.toLowerCase() || '';
    if (l === 'finalisée') return 'task-status-done';
    if (l === 'en cours') return 'task-status-progress';
    if (l === 'dépassée') return 'task-status-overdue';
    return 'task-status-open';
  }

  // Document helpers
  getDocIcon(type?: string): string {
    if (!type) return '📄';
    if (type.includes('mail')) return '📧';
    if (type.includes('rapport')) return '📋';
    return '📄';
  }

  getDocStatus(doc: Document): string {
    return 'brouillon';  // Will be computed from actual status field if available
  }

  getDocStatusClass(doc: Document): string {
    return 'brouillon';
  }

  // Create task
  createTask(): void {
    if (!this.feedback || !this.newTask.taskName) return;
    const payload = {
      feedbackId: this.feedback.feedbackId,
      taskName: this.newTask.taskName,
      startDate: this.newTask.startDate || null,
      dueDate: this.newTask.dueDate || null,
      assignedToUserId: this.newTask.assignedToUserId,
      statusId: this.newTask.statusId,
      isHighPriority: false,
      description: this.newTask.description,
    };

    this.http.post<Task>(`${this.apiUrl}/tasks`, payload).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.showCreateTaskModal = false;
        this.newTask = { taskName: '', startDate: '', dueDate: '', assignedToUserId: null, statusId: null, description: '' };
        this.buildAssignedUsers();
      },
      error: (err) => console.error('Error creating task:', err)
    });
  }

  // Submit comment
  submitComment(): void {
    if (!this.feedback || !this.newCommentText.trim()) return;
    const payload = {
      feedbackId: this.feedback.feedbackId,
      content: this.newCommentText,
      authorUserId: null, // Would come from auth context
    };

    this.http.post<Comment>(`${this.apiUrl}/comments`, payload).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.showCommentModal = false;
        this.newCommentText = '';
      },
      error: (err) => console.error('Error posting comment:', err)
    });
  }
}
