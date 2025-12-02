import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, List } from 'lucide-react';

export const Layout: React.FC = () => {
    return (
        <div className="container">
            <main style={{ flex: 1, paddingBottom: '80px' }}>
                <Outlet />
            </main>

            <nav className="bottom-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={24} />
                    <span>Home</span>
                </NavLink>

                <NavLink
                    to="/analytics"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <PieChart size={24} />
                    <span>Analytics</span>
                </NavLink>

                <NavLink
                    to="/movements"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <List size={24} />
                    <span>Manage</span>
                </NavLink>
            </nav>
        </div>
    );
};

// Add styles for Layout to index.css later or inline for now?
// I'll append to index.css in a separate step or just use a style tag here for simplicity if it was a small component,
// but for a main layout, I should probably add to index.css.
// For now, I'll rely on the class names I'll add to index.css next.
