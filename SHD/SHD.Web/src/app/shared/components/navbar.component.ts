import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="nav-left">
          <a routerLink="/dashboard" class="nav-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#111827" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="#111827" stroke-width="2" stroke-linecap="round"/></svg>
            <span>Feedback Management</span>
          </a>
          <div class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Tableau de bord</a>
            <a routerLink="/feedbacks" routerLinkActive="active" class="nav-link has-arrow">Gestion des feedbacks</a>
            <a routerLink="/collaborateurs" routerLinkActive="active" class="nav-link">Collaborateurs</a>
            <a routerLink="/clients" routerLinkActive="active" class="nav-link">Clients</a>
            <a routerLink="/reporting" routerLinkActive="active" class="nav-link">Reporting</a>
          </div>
        </div>
        <div class="nav-right">
          <button class="nav-icon-btn">
            <svg width="20" height="20" fill="none" stroke="#111827" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round"/></svg>
          </button>
          <div class="nav-flag">🇫🇷</div>
          <button class="nav-icon-btn notification-btn">
            <svg width="20" height="20" fill="none" stroke="#111827" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="notification-dot"></span>
          </button>
          <div class="nav-user">
            <div class="user-avatar">
              <svg width="20" height="20" fill="none" stroke="#6b7280" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="user-info">
              <span class="user-name">NOGUEIRA Maria</span>
              <span class="user-role">Gestionnaire</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="#6b7280" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-left { display: flex; align-items: center; gap: 32px; }
    .nav-logo {
      display: flex; align-items: center; gap: 8px;
      font-weight: 600; font-size: 15px; color: #111827;
      white-space: nowrap;
    }
    .nav-links { display: flex; gap: 0; }
    .nav-link {
      padding: 16px 14px;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      border-bottom: 2px solid transparent;
      transition: all .15s;
    }
    .nav-link:hover { color: #111827; }
    .nav-link.active { color: #111827; font-weight: 600; border-bottom-color: #111827; }
    .has-arrow::after { content: ' ▾'; font-size: 10px; }

    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-icon-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; border-radius: 50%;
      transition: background .15s;
    }
    .nav-icon-btn:hover { background: #f3f4f6; }
    .notification-btn { position: relative; }
    .notification-dot {
      position: absolute; top: 6px; right: 6px;
      width: 8px; height: 8px;
      background: #dc2626;
      border-radius: 50%;
      border: 2px solid #fff;
    }
    .nav-flag { font-size: 18px; }
    .nav-user {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 8px 4px 4px;
      cursor: pointer;
    }
    .user-avatar {
      width: 32px; height: 32px;
      border: 1px solid #e5e7eb;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #f9fafb;
    }
    .user-info { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 13px; font-weight: 600; color: #111827; }
    .user-role { font-size: 11px; color: #9ca3af; }
  `]
})
export class NavbarComponent {}
