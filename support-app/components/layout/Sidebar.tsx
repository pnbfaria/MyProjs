'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Bell, FileBarChart, Zap, Settings, BarChart3 } from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Tickets', href: '/tickets', icon: Ticket },
      { label: 'Alerts', href: '/alerts', icon: Bell },
      { label: 'Reports', href: '/reports', icon: FileBarChart },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-lg) var(--space-sm) var(--space-md)',
        marginBottom: 'var(--space-lg)',
        gap: '8px',
      }}>
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
        }}>
          <img 
            src="/fujitsu-logo.png" 
            alt="Fujitsu" 
            style={{ 
              width: '140px', 
              height: 'auto', 
              objectFit: 'contain',
            }} 
          />
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.85)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          Support <span style={{ color: 'var(--color-accent)' }}>Hub</span>
        </div>
      </div>

      {/* Navigation */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          <ul className="sidebar-nav">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="sidebar-nav-icon" size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Bottom section */}
      <div style={{ marginTop: 'auto', padding: '0 var(--space-lg)' }}>
        <div
          style={{
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            eSignature Space
          </div>
          <div>Jira integration active</div>
        </div>
      </div>
    </aside>
  );
}
