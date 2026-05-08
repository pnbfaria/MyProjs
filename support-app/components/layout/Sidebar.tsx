'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Bell, FileBarChart, Settings, BarChart3 } from 'lucide-react';

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
      {/* Logo — 1984-Style Chrome Hello Kitty */}
      <div className="sidebar-logo" style={{ 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-md) var(--space-sm)',
        marginBottom: 'var(--space-xl)'
      }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '10px',
        }}>
          <img 
            src="/hello-kitty-chrome.png" 
            alt="Anti-Gravity" 
            className="neon-logo"
            style={{ 
              width: '68px', 
              height: '68px', 
              objectFit: 'contain',
              borderRadius: '8px',
            }} 
          />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 800,
          color: 'var(--neon-cyan)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0, 240, 255, 0.15)',
          width: '80%',
          marginTop: '4px',
          textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
        }}>
          Support <span style={{ 
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px rgba(255, 45, 120, 0.5)',
          }}>Hub</span>
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
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ 
            fontFamily: 'var(--font-display)',
            fontWeight: 600, 
            color: 'var(--neon-cyan)', 
            marginBottom: '4px',
            fontSize: '10px',
            letterSpacing: '0.1em',
            textShadow: '0 0 6px rgba(0, 240, 255, 0.3)',
          }}>
            eSignature Space
          </div>
          <div style={{ color: 'var(--color-text-muted)' }}>
            <span style={{ 
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--neon-green)',
              boxShadow: '0 0 6px var(--neon-green)',
              marginRight: '6px',
              verticalAlign: 'middle',
            }}/>
            Jira integration active
          </div>
        </div>
      </div>
    </aside>
  );
}
