import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReferenceService } from '../../core/services/reference.service';
import { FeedbackService } from '../../core/services/feedback.service';
import {
  RefSubject, RefChannel, RefPlace, RefCategory, RefSeverity,
  RefFrequency, RefVisibility, OrgUnit, Client, User
} from '../../core/models/shd.models';
import { forkJoin } from 'rxjs';

/* ── helper interfaces ── */
interface CategoryNode {
  category: RefCategory;
  children: CategoryNode[];
  expanded: boolean;
  checked: boolean;
  visible: boolean;
}

@Component({
  selector: 'app-feedback-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="modal-backdrop" (click)="close.emit()"></div>

    <!-- Modal -->
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Formulaire d'une plainte</h2>
        <button class="modal-close" (click)="close.emit()">✕</button>
      </div>

      <!-- Stepper -->
      <div class="stepper">
        <div class="step" *ngFor="let step of steps; let i = index"
             [class.active]="currentStep === i"
             [class.completed]="currentStep > i"
             (click)="goToStep(i)">
          <div class="step-circle">
            <span *ngIf="currentStep > i">✓</span>
            <span *ngIf="currentStep <= i">○</span>
          </div>
          <span class="step-label">{{step}}</span>
        </div>
      </div>

      <!-- Required note -->
      <p class="required-note">Tous les champs marqués d'un astérisque (<span class="req">*</span>) sont obligatoires.</p>

      <!-- Step content -->
      <div class="modal-body">

        <!-- ═══════════ Step 1: Description ═══════════ -->
        <div *ngIf="currentStep === 0" class="step-content">
          <!-- Numéro -->
          <div class="form-row">
            <label class="form-label">Numéro de la plainte</label>
            <div class="form-value">{{generatedNumber}}</div>
          </div>

          <!-- Sujet -->
          <div class="form-row">
            <label class="form-label">Sujet de la plainte<span class="req">*</span></label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="form.subjectId">
                <option [ngValue]="null">choisir le sujet...</option>
                <option *ngFor="let s of subjects" [ngValue]="s.subjectId">{{s.label}}</option>
              </select>
              <span class="form-hint">sujet introuvable ? <a class="form-link">Saisir manuellement</a></span>
            </div>
          </div>

          <!-- Mode d'introduction (Channel) -->
          <div class="form-row">
            <label class="form-label">Mode d'introduction<span class="req">*</span></label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="form.channelId">
                <option [ngValue]="null">choisir le mode d'introduction...</option>
                <option *ngFor="let ch of channels" [ngValue]="ch.channelId">{{ch.label}}</option>
              </select>
            </div>
          </div>

          <!-- Humeur -->
          <div class="form-row mood-row">
            <label class="form-label">Humeur du client/plaignant au début</label>
            <div class="mood-track-container">
              <input type="range" min="1" max="5" step="1"
                     [(ngModel)]="form.clientMoodScore" class="mood-slider" />
              <div class="mood-labels">
                <span>Très bien</span><span>Bien</span><span>Neutre</span><span>Mauvais</span><span>Très mauvais</span>
              </div>
            </div>
          </div>

          <!-- Lieu -->
          <div class="form-row">
            <label class="form-label">Lieu d'introduction<span class="req">*</span></label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="form.placeId">
                <option [ngValue]="null">choisir le lieu d'introduction...</option>
                <option *ngFor="let p of places" [ngValue]="p.placeId">{{p.label}}</option>
              </select>
            </div>
          </div>

          <!-- Date -->
          <div class="form-row">
            <label class="form-label">Date de réception de la plainte<span class="req">*</span></label>
            <div class="form-field">
              <input type="datetime-local" class="form-control" [(ngModel)]="form.receivedDate" />
            </div>
          </div>

          <!-- Description -->
          <div class="form-row">
            <label class="form-label">Description<span class="req">*</span></label>
            <div class="form-field">
              <textarea class="form-control form-textarea"
                        placeholder="écrire la description ici..."
                        [(ngModel)]="form.description"></textarea>
            </div>
          </div>
        </div>

        <!-- ═══════════ Step 2: Catégorie ═══════════ -->
        <div *ngIf="currentStep === 1" class="step-content">
          <div class="category-header">
            <label class="form-label" style="width:100%; padding-top:0">Catégorie de la plainte<span class="req">*</span></label>
            <p class="category-hint">Veuillez sélectionner une ou plusieurs catégories correspondant à la plainte.</p>
          </div>

          <!-- Search -->
          <div class="category-search-wrapper">
            <svg class="search-icon" width="16" height="16" fill="#9ca3af" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>
            <input type="text" class="category-search" placeholder="Rechercher..."
                   [(ngModel)]="categorySearch" (ngModelChange)="filterCategories()" />
          </div>

          <div class="category-results-count">{{visibleCategoryCount}} résultats</div>

          <!-- Tree -->
          <div class="category-tree">
            <ng-container *ngFor="let node of categoryTree">
              <ng-container *ngIf="node.visible">
                <ng-container *ngTemplateOutlet="categoryNodeTpl; context: {node: node, depth: 0}"></ng-container>
              </ng-container>
            </ng-container>
          </div>

          <ng-template #categoryNodeTpl let-node="node" let-depth="depth">
            <div class="cat-node" [style.paddingLeft.px]="depth * 28">
              <button class="cat-toggle" *ngIf="node.children.length" (click)="node.expanded = !node.expanded">
                <svg [class.rotated]="node.expanded" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <span class="cat-toggle-spacer" *ngIf="!node.children.length"></span>
              <label class="cat-checkbox-label">
                <input type="checkbox" [checked]="node.checked" (change)="toggleCategory(node)" />
                <span [class.cat-label-bold]="node.children.length > 0">{{node.category.label}}</span>
              </label>
            </div>
            <ng-container *ngIf="node.expanded">
              <ng-container *ngFor="let child of node.children">
                <ng-container *ngIf="child.visible">
                  <ng-container *ngTemplateOutlet="categoryNodeTpl; context: {node: child, depth: depth + 1}"></ng-container>
                </ng-container>
              </ng-container>
            </ng-container>
          </ng-template>

          <!-- Selection display -->
          <div class="category-selection-info">
            Sélection: <strong>{{getSelectedCategoryLabel()}}</strong>
          </div>
        </div>

        <!-- ═══════════ Step 3: Personnes concernées ═══════════ -->
        <div *ngIf="currentStep === 2" class="step-content">
          <!-- Client -->
          <div class="form-row">
            <label class="form-label">Concerne client(e)</label>
            <div class="form-field">
              <div class="search-select-container">
                <input type="text" class="form-control"
                       placeholder="Rechercher un(e) client(e)..."
                       [(ngModel)]="clientSearch"
                       (ngModelChange)="searchClients()"
                       (focus)="showClientDropdown = true" />
                <span class="selected-chip" *ngIf="selectedClient" (click)="clearClient()">
                  {{selectedClient.lastName}} {{selectedClient.firstName}} ✕
                </span>
                <div class="search-dropdown" *ngIf="showClientDropdown && filteredClients.length">
                  <div class="dropdown-item" *ngFor="let c of filteredClients" (click)="selectClient(c)">
                    {{c.lastName}} {{c.firstName}}
                  </div>
                </div>
              </div>
              <span class="form-hint">Client(e) introuvable ? <a class="form-link">Saisir manuellement</a></span>
            </div>
          </div>

          <!-- Is Requérant -->
          <div class="form-row">
            <label class="form-label">Le/la client(e) est-il (elle) requérant(e)?</label>
            <div class="form-field radio-row">
              <label class="radio-label"><input type="radio" name="isRequerant" [value]="true" [(ngModel)]="isRequerant" /> Oui</label>
              <label class="radio-label"><input type="radio" name="isRequerant" [value]="false" [(ngModel)]="isRequerant" /> Non</label>
            </div>
          </div>

          <!-- Requérant name (if not same person) -->
          <div class="form-row" *ngIf="!isRequerant">
            <label class="form-label">Nom du/de la requérant(e)</label>
            <div class="form-field">
              <input type="text" class="form-control" [(ngModel)]="requerantName" placeholder="Nom du requérant..." />
            </div>
          </div>

          <!-- Lien avec client -->
          <div class="form-row" *ngIf="!isRequerant">
            <label class="form-label">Lien avec le/la client(e)</label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="lienClient">
                <option value="">choisir...</option>
                <option value="Famille">Famille</option>
                <option value="Ami">Ami</option>
                <option value="Représentant légal">Représentant légal</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <!-- OrgUnit(s) -->
          <div class="form-row">
            <label class="form-label">OrgUnit(s) visée(s)<span class="req">*</span></label>
            <div class="form-field">
              <div class="multi-select-container" (click)="showOrgUnitDropdown = !showOrgUnitDropdown">
                <div class="selected-chips">
                  <span class="selected-chip" *ngFor="let ou of selectedOrgUnits" (click)="removeOrgUnit(ou); $event.stopPropagation()">
                    {{ou.name}} ✕
                  </span>
                  <span class="multi-placeholder" *ngIf="!selectedOrgUnits.length">sélectionner une ou plusieurs OrgUnits...</span>
                </div>
                <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
              <div class="search-dropdown" *ngIf="showOrgUnitDropdown">
                <div class="dropdown-item" *ngFor="let ou of availableOrgUnits" (click)="addOrgUnit(ou); $event.stopPropagation()">
                  {{ou.name}}
                </div>
              </div>
            </div>
          </div>

          <!-- Attribué à -->
          <div class="form-row">
            <label class="form-label">Attribué à</label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="form.createdByUserId">
                <option [ngValue]="null">attribué à...</option>
                <option *ngFor="let u of filteredUsers" [ngValue]="u.userId">{{u.lastName}} {{u.firstName}}</option>
              </select>
              <span class="form-hint">Seuls les membres de l'OrgUnit(s) sélectionnée(s) sont affichés.</span>
            </div>
          </div>

          <!-- Visibilité -->
          <div class="form-row visibility-row">
            <label class="form-label" style="width:100%; padding-top:0">Visibilité du feedback</label>
            <div class="visibility-chips">
              <label class="visibility-chip" *ngFor="let v of visibilities"
                     [class.selected]="isVisibilitySelected(v.visibilityId)">
                {{v.label}}
                <input type="checkbox" [checked]="isVisibilitySelected(v.visibilityId)"
                       (change)="toggleVisibility(v.visibilityId)" />
                <span class="chip-check" *ngIf="isVisibilitySelected(v.visibilityId)">☑</span>
              </label>
            </div>
          </div>
        </div>

        <!-- ═══════════ Step 4: Gravité et risque ═══════════ -->
        <div *ngIf="currentStep === 3" class="step-content">
          <!-- Gravité -->
          <div class="form-row severity-row">
            <label class="form-label" style="width:100%; padding-top:0">Gravité<span class="req">*</span></label>
            <p class="severity-question">A quel point estimez-vous que la situation est grave?</p>

            <!-- Collapsible explanation -->
            <div class="severity-explanation">
              <button class="explanation-toggle" (click)="showSeverityExplanation = !showSeverityExplanation">
                <svg [class.rotated]="showSeverityExplanation" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                Explication de la gravité
              </button>
              <div class="explanation-content" *ngIf="showSeverityExplanation">
                <div class="explanation-item" *ngFor="let sev of severities">
                  <strong>{{sev.severityLevel}} - {{sev.label}} :</strong> {{sev.description || 'Pas de description disponible.'}}
                </div>
              </div>
            </div>

            <!-- Severity slider -->
            <div class="severity-slider-container">
              <input type="range" [min]="severityMin" [max]="severityMax" step="1"
                     [(ngModel)]="form.severityId" class="severity-slider" />
              <div class="severity-labels">
                <span *ngFor="let sev of severities">{{sev.label}}<br/><small>(niveau {{sev.severityLevel}})</small></span>
              </div>
            </div>
          </div>

          <!-- Fréquence -->
          <div class="form-row">
            <label class="form-label">Fréquence<span class="req">*</span></label>
            <div class="form-field">
              <select class="form-control with-chevron" [(ngModel)]="form.frequencyId">
                <option [ngValue]="null">évaluer la fréquence...</option>
                <option *ngFor="let f of frequencies" [ngValue]="f.frequencyLevel">{{f.label}}</option>
              </select>
            </div>
          </div>

          <!-- Priority / Criticité display -->
          <div class="form-row priority-display">
            <div class="priority-info">
              <span class="priority-arrow" (click)="showPriorityDetail = !showPriorityDetail">
                <svg [class.rotated]="showPriorityDetail" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </span>
              <span>Priorité: <strong>{{computedPriority}}</strong></span>
              <span style="margin-left: 16px">Criticité</span>
              <span class="criticite-badge" [ngClass]="criticiteBadgeClass">{{criticiteLabel}}</span>
              <span class="info-icon" title="La criticité est calculée à partir de la gravité et de la fréquence.">ⓘ</span>
            </div>
          </div>
        </div>

        <!-- Step navigation -->
        <div class="step-nav">
          <button class="btn btn-step-prev" *ngIf="currentStep > 0" (click)="currentStep = currentStep - 1">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Étape précédente
          </button>
          <span class="step-nav-spacer"></span>
          <button class="btn btn-step-next" *ngIf="currentStep < steps.length - 1" (click)="currentStep = currentStep + 1">
            Étape suivante
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="close.emit()">Annuler</button>
        <button class="btn btn-outline" (click)="saveDraft()">Sauvegarder le brouillon</button>
        <button class="btn btn-primary-blue" [class.btn-disabled]="isSubmitting" (click)="submitFeedback()">Soumettre la plainte</button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Modal Shell ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 1000;
    }
    .modal-container {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 640px; max-height: 90vh; background: #fff; border-radius: 12px;
      z-index: 1001; display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,.2);
    }

    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
    .modal-title { font-size: 18px; font-weight: 700; }
    .modal-close { background: none; border: none; font-size: 20px; color: #6b7280; cursor: pointer; }

    /* ── Stepper ── */
    .stepper { display: flex; align-items: center; gap: 0; padding: 16px 24px; border-bottom: 1px solid #f3f4f6; overflow: hidden; }
    .step { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #9ca3af; cursor: pointer; flex-shrink: 0; }
    .step.active { color: #111827; font-weight: 600; }
    .step.completed { color: #111827; }
    .step:not(:last-child)::after { content: ''; display: block; width: 20px; margin: 0 6px; flex-shrink: 0; }
    .step-circle { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
    .step.active .step-circle { border-color: #111827; background: #fff; }
    .step.completed .step-circle { border-color: #16a34a; background: #dcfce7; color: #16a34a; }
    .step-label { white-space: nowrap; font-size: 12px; }

    .required-note { padding: 12px 24px 0; font-size: 13px; color: #6b7280; }
    .req { color: #dc2626; }

    .modal-body { flex: 1; overflow-y: auto; padding: 8px 24px 16px; }
    .step-content { display: flex; flex-direction: column; gap: 0; }

    /* ── Form rows ── */
    .form-row { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .form-label { width: 200px; font-size: 14px; color: #374151; padding-top: 8px; flex-shrink: 0; }
    .form-field { flex: 1; }
    .form-value { font-size: 14px; font-weight: 500; padding-top: 8px; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #fff; }
    .form-control:focus { outline: none; border-color: #2563eb; }
    .form-control.with-chevron { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
    .form-textarea { min-height: 80px; resize: vertical; }
    .form-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; display: block; }
    .form-link { color: #111827; text-decoration: underline; cursor: pointer; }

    /* ── Mood slider ── */
    .mood-row { flex-direction: column; }
    .mood-row .form-label { width: 100%; margin-bottom: 12px; padding-top: 0; }
    .mood-track-container { width: 100%; }
    .mood-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 6px; background: #e5e7eb; border-radius: 3px; outline: none; }
    .mood-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #111827; cursor: pointer; }
    .mood-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #111827; cursor: pointer; border: none; }
    .mood-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; padding: 6px 0; }

    /* ── Category step ── */
    .category-header { padding-bottom: 8px; }
    .category-hint { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .category-search-wrapper { position: relative; margin: 12px 0 8px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
    .category-search { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
    .category-search:focus { outline: none; border-color: #2563eb; }
    .category-results-count { font-size: 13px; color: #6b7280; margin-bottom: 8px; }

    .category-tree { max-height: 320px; overflow-y: auto; border: 1px solid #f3f4f6; border-radius: 6px; padding: 8px 0; }
    .cat-node { display: flex; align-items: center; gap: 6px; padding: 6px 12px; }
    .cat-toggle { background: none; border: none; padding: 0; cursor: pointer; color: #6b7280; display: flex; align-items: center; width: 18px; flex-shrink: 0; }
    .cat-toggle svg { transition: transform .15s; }
    .cat-toggle svg.rotated { transform: rotate(90deg); }
    .cat-toggle-spacer { width: 18px; flex-shrink: 0; }
    .cat-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; }
    .cat-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #111827; cursor: pointer; }
    .cat-label-bold { font-weight: 600; }
    .category-selection-info { padding: 12px 0; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; margin-top: 8px; }

    /* ── Search/select with dropdown ── */
    .search-select-container { position: relative; }
    .selected-chip { display: inline-flex; align-items: center; gap: 4px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 8px; font-size: 13px; cursor: pointer; margin-top: 6px; }
    .selected-chip:hover { background: #e5e7eb; }
    .search-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,.1); z-index: 10; max-height: 200px; overflow-y: auto; }
    .dropdown-item { padding: 8px 12px; font-size: 14px; cursor: pointer; }
    .dropdown-item:hover { background: #f3f4f6; }

    /* ── Multi select ── */
    .multi-select-container { display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 12px; min-height: 38px; cursor: pointer; position: relative; }
    .selected-chips { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }
    .multi-placeholder { color: #9ca3af; font-size: 14px; }
    .chevron-icon { flex-shrink: 0; margin-left: 8px; }

    /* ── Radio ── */
    .radio-row { display: flex; gap: 20px; align-items: center; padding-top: 8px; }
    .radio-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
    .radio-label input { accent-color: #111827; }

    /* ── Visibility chips ── */
    .visibility-row { flex-direction: column; }
    .visibility-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .visibility-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 20px; font-size: 13px; cursor: pointer; transition: all .15s; background: #fff; }
    .visibility-chip.selected { background: #111827; color: #fff; border-color: #111827; }
    .visibility-chip input { display: none; }
    .chip-check { font-size: 14px; }

    /* ── Severity step ── */
    .severity-row { flex-direction: column; }
    .severity-question { font-size: 14px; color: #6b7280; margin: 4px 0 12px; }
    .severity-explanation { margin-bottom: 16px; }
    .explanation-toggle { display: flex; align-items: center; gap: 6px; background: none; border: none; font-size: 14px; font-weight: 500; color: #374151; cursor: pointer; padding: 0; }
    .explanation-toggle svg { transition: transform .15s; }
    .explanation-toggle svg.rotated { transform: rotate(90deg); }
    .explanation-content { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 12px 16px; margin-top: 8px; }
    .explanation-item { font-size: 13px; color: #374151; margin-bottom: 8px; line-height: 1.5; }
    .explanation-item:last-child { margin-bottom: 0; }

    .severity-slider-container { width: 100%; }
    .severity-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 6px; background: #e5e7eb; border-radius: 3px; outline: none; }
    .severity-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #111827; cursor: pointer; }
    .severity-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #111827; cursor: pointer; border: none; }
    .severity-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; padding: 6px 0; text-align: center; }
    .severity-labels span { flex: 1; }
    .severity-labels small { font-size: 11px; color: #9ca3af; }

    /* ── Priority display ── */
    .priority-display { border-bottom: none; }
    .priority-info { display: flex; align-items: center; gap: 8px; font-size: 14px; padding-top: 4px; }
    .priority-arrow { cursor: pointer; display: flex; align-items: center; }
    .priority-arrow svg { transition: transform .15s; }
    .priority-arrow svg.rotated { transform: rotate(90deg); }
    .criticite-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 13px; font-weight: 500; border: 1px solid; }
    .criticite-faible { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .criticite-moderee { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
    .criticite-importante { background: #fff7ed; color: #ea580c; border-color: #fed7aa; }
    .criticite-critique { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .info-icon { color: #9ca3af; cursor: help; font-size: 16px; }

    /* ── Step navigation ── */
    .step-nav { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; }
    .step-nav-spacer { flex: 1; }
    .btn-step-next, .btn-step-prev { display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 14px; font-weight: 500; cursor: pointer; background: none; border: none; color: #374151; }
    .btn-step-next:hover, .btn-step-prev:hover { color: #111827; }

    /* ── Footer ── */
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px; border-top: 1px solid #e5e7eb;
    }
    .btn-disabled { opacity: .5; pointer-events: none; }
  `]
})
export class FeedbackCreateComponent implements OnInit {
  @Input() feedbackType: string = 'plainte';
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<any>();

  currentStep = 0;
  steps = ['Description', 'Catégorie', 'Personnes concernées', 'Gravité et risque'];
  isSubmitting = false;

  /* ── Reference data ── */
  subjects: RefSubject[] = [];
  channels: RefChannel[] = [];
  places: RefPlace[] = [];
  categories: RefCategory[] = [];
  severities: RefSeverity[] = [];
  frequencies: RefFrequency[] = [];
  visibilities: RefVisibility[] = [];
  orgUnits: OrgUnit[] = [];
  allClients: Client[] = [];
  allUsers: User[] = [];

  /* ── Form data ── */
  form: any = {
    subjectId: null,
    channelId: null,
    placeId: null,
    receivedDate: '',
    description: '',
    clientMoodScore: 3,
    categoryId: null,
    clientId: null,
    createdByUserId: null,
    severityId: 1,
    frequencyId: null,
    isLitigation: false,
    typeId: null,
    statusId: null,
  };

  generatedNumber = 'FB-...';

  /* ── Category tree ── */
  categoryTree: CategoryNode[] = [];
  categorySearch = '';
  visibleCategoryCount = 0;

  /* ── Step 3 state ── */
  clientSearch = '';
  filteredClients: Client[] = [];
  showClientDropdown = false;
  selectedClient: Client | null = null;
  isRequerant = false;
  requerantName = '';
  lienClient = '';
  selectedOrgUnits: OrgUnit[] = [];
  showOrgUnitDropdown = false;
  filteredUsers: User[] = [];
  selectedVisibilityIds: number[] = [];

  /* ── Step 4 state ── */
  showSeverityExplanation = false;
  showPriorityDetail = false;
  severityMin = 1;
  severityMax = 5;

  constructor(
    private refService: ReferenceService,
    private feedbackService: FeedbackService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadReferenceData();
  }

  loadReferenceData(): void {
    forkJoin({
      subjects: this.refService.getSubjects(),
      channels: this.refService.getChannels(),
      places: this.refService.getPlaces(),
      categories: this.refService.getCategories(),
      severities: this.refService.getSeverities(),
      frequencies: this.refService.getFrequencies(),
      visibilities: this.refService.getVisibilities(),
      orgUnits: this.refService.getOrgUnits(),
      statuses: this.refService.getStatuses(),
      types: this.refService.getTypes(),
    }).subscribe(data => {
      this.subjects = data.subjects;
      this.channels = data.channels;
      this.places = data.places;
      this.categories = data.categories;
      this.severities = data.severities.sort((a, b) => a.severityLevel - b.severityLevel);
      this.frequencies = data.frequencies.sort((a, b) => a.frequencyLevel - b.frequencyLevel);
      this.visibilities = data.visibilities;
      this.orgUnits = data.orgUnits;

      // Set severity range
      if (this.severities.length) {
        this.severityMin = this.severities[0].severityLevel;
        this.severityMax = this.severities[this.severities.length - 1].severityLevel;
        this.form.severityId = this.severityMin;
      }

      // Set default type (plainte) and status (brouillon/en cours)
      const plainteType = data.types.find(t => t.label.toLowerCase().includes('plainte'));
      if (plainteType) this.form.typeId = plainteType.typeId;
      const brouillonStatus = data.statuses.find(s => s.label.toLowerCase().includes('brouillon') && (!s.appliesTo || s.appliesTo === 'Feedback'));
      if (brouillonStatus) this.form.statusId = brouillonStatus.statusId;

      // Build category tree
      this.buildCategoryTree();

      // Set default date
      const now = new Date();
      this.form.receivedDate = now.toISOString().slice(0, 16);
    });

    // Load clients
    this.http.get<Client[]>('http://localhost:5034/api/clients?pageSize=100').subscribe(c => this.allClients = c);
    // Load users
    this.http.get<User[]>('http://localhost:5034/api/users').subscribe(u => this.allUsers = u);
  }

  /* ── Category tree helpers ── */
  buildCategoryTree(): void {
    const map = new Map<number, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const cat of this.categories) {
      map.set(cat.categoryId, { category: cat, children: [], expanded: false, checked: false, visible: true });
    }

    for (const cat of this.categories) {
      const node = map.get(cat.categoryId)!;
      if (cat.parentCategoryId && map.has(cat.parentCategoryId)) {
        map.get(cat.parentCategoryId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    this.categoryTree = roots;
    this.updateVisibleCount();
  }

  filterCategories(): void {
    const q = this.categorySearch.toLowerCase().trim();
    const markVisible = (node: CategoryNode): boolean => {
      let childVisible = false;
      for (const child of node.children) {
        if (markVisible(child)) childVisible = true;
      }
      const selfMatch = !q || node.category.label.toLowerCase().includes(q);
      node.visible = selfMatch || childVisible;
      if (node.visible && q) node.expanded = true;
      return node.visible;
    };
    this.categoryTree.forEach(n => markVisible(n));
    this.updateVisibleCount();
  }

  updateVisibleCount(): void {
    let count = 0;
    const countVisible = (nodes: CategoryNode[]) => {
      for (const n of nodes) {
        if (n.visible) count++;
        countVisible(n.children);
      }
    };
    countVisible(this.categoryTree);
    this.visibleCategoryCount = count;
  }

  toggleCategory(node: CategoryNode): void {
    node.checked = !node.checked;
    if (node.checked) {
      this.form.categoryId = node.category.categoryId;
      // Uncheck others
      const uncheckAll = (nodes: CategoryNode[]) => {
        for (const n of nodes) {
          if (n !== node) n.checked = false;
          uncheckAll(n.children);
        }
      };
      uncheckAll(this.categoryTree);
    } else {
      this.form.categoryId = null;
    }
  }

  getSelectedCategoryLabel(): string {
    const findChecked = (nodes: CategoryNode[]): string => {
      for (const n of nodes) {
        if (n.checked) return n.category.label;
        const child = findChecked(n.children);
        if (child) return child;
      }
      return '';
    };
    return findChecked(this.categoryTree) || 'aucune';
  }

  /* ── Step 3 helpers ── */
  searchClients(): void {
    const q = this.clientSearch.toLowerCase().trim();
    if (!q) { this.filteredClients = []; return; }
    this.filteredClients = this.allClients.filter(c =>
      c.lastName.toLowerCase().includes(q) || c.firstName.toLowerCase().includes(q)
    ).slice(0, 10);
  }

  selectClient(c: Client): void {
    this.selectedClient = c;
    this.form.clientId = c.clientId;
    this.clientSearch = '';
    this.filteredClients = [];
    this.showClientDropdown = false;
  }

  clearClient(): void {
    this.selectedClient = null;
    this.form.clientId = null;
  }

  get availableOrgUnits(): OrgUnit[] {
    return this.orgUnits.filter(ou => !this.selectedOrgUnits.some(s => s.orgUnitId === ou.orgUnitId));
  }

  addOrgUnit(ou: OrgUnit): void {
    this.selectedOrgUnits.push(ou);
    this.showOrgUnitDropdown = false;
    this.updateFilteredUsers();
  }

  removeOrgUnit(ou: OrgUnit): void {
    this.selectedOrgUnits = this.selectedOrgUnits.filter(s => s.orgUnitId !== ou.orgUnitId);
    this.updateFilteredUsers();
  }

  updateFilteredUsers(): void {
    if (!this.selectedOrgUnits.length) {
      this.filteredUsers = this.allUsers;
    } else {
      const ids = this.selectedOrgUnits.map(ou => ou.orgUnitId);
      this.filteredUsers = this.allUsers.filter(u => u.orgUnitId && ids.includes(u.orgUnitId));
    }
  }

  isVisibilitySelected(id: number): boolean {
    return this.selectedVisibilityIds.includes(id);
  }

  toggleVisibility(id: number): void {
    const idx = this.selectedVisibilityIds.indexOf(id);
    if (idx >= 0) this.selectedVisibilityIds.splice(idx, 1);
    else this.selectedVisibilityIds.push(id);
  }

  /* ── Step 4 helpers ── */
  get computedPriority(): number {
    const sev = this.form.severityId || 1;
    const freq = this.form.frequencyId || 1;
    return Math.round((sev + freq) / 2);
  }

  get criticiteLabel(): string {
    const p = this.computedPriority;
    if (p <= 1) return 'Faible';
    if (p <= 2) return 'Modérée';
    if (p <= 3) return 'Importante';
    return 'Critique';
  }

  get criticiteBadgeClass(): string {
    const p = this.computedPriority;
    if (p <= 1) return 'criticite-faible';
    if (p <= 2) return 'criticite-moderee';
    if (p <= 3) return 'criticite-importante';
    return 'criticite-critique';
  }

  /* ── Navigation ── */
  goToStep(i: number): void {
    if (i <= this.currentStep) this.currentStep = i;
  }

  /* ── Submit ── */
  saveDraft(): void {
    // Set status to brouillon if available, then submit
    this.submitFeedback();
  }

  submitFeedback(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      feedbackNumber: '',  // Will be auto-generated by backend
      typeId: this.form.typeId,
      subjectId: this.form.subjectId,
      categoryId: this.form.categoryId,
      channelId: this.form.channelId,
      placeId: this.form.placeId,
      receivedDate: this.form.receivedDate ? new Date(this.form.receivedDate).toISOString() : null,
      description: this.form.description,
      clientMoodScore: this.form.clientMoodScore,
      isLitigation: this.form.isLitigation,
      statusId: this.form.statusId,
      severityId: this.form.severityId,
      frequencyId: this.form.frequencyId,
      clientId: this.form.clientId,
      createdByUserId: this.form.createdByUserId,
      orgUnitIds: this.selectedOrgUnits.map(ou => ou.orgUnitId),
      visibilityIds: this.selectedVisibilityIds,
    };

    this.http.post('http://localhost:5034/api/feedbacks', payload).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.created.emit(result);
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating feedback:', err);
      }
    });
  }
}
