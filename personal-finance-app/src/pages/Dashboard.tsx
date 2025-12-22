import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../lib/supabase';
import type { MovementWithDetails } from '../types/schema';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
    const [recentMovements, setRecentMovements] = useState<MovementWithDetails[]>([]);
    const [monthStats, setMonthStats] = useState({ income: 0, expense: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const movements = await supabaseService.getRecentMovements(5);
            setRecentMovements(movements);
            const now = new Date();
            const stats = await supabaseService.getMonthBalance(now.getMonth(), now.getFullYear());
            setMonthStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <header className="flex justify-between w-full items-center py-4">
                <div>
                    <h1 className="text-xl font-bold">My Finances</h1>
                    <p className="text-sm text-secondary">Welcome back</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="font-bold text-sm">P</span>
                </div>
            </header>

            {/* Balance Card */}
            <div className="card w-full" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-secondary mb-1">Total Balance (Month)</p>
                            <h2 className="text-3xl font-bold text-white">{formatCurrency(monthStats.total)}</h2>
                        </div>
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <Wallet size={20} className="text-accent-primary" />
                        </div>
                    </div>
                    {/* Income / Expense summary */}
                    <div className="flex gap-8 justify-center">
                        <div className="flex flex-col items-center">
                            <TrendingUp size={20} className="text-emerald-500" />
                            <p className="text-xs text-secondary">Income</p>
                            <p className="text-sm font-medium text-emerald-500">{formatCurrency(monthStats.income)}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <TrendingDown size={20} className="text-rose-500" />
                            <p className="text-xs text-secondary">Expenses</p>
                            <p className="text-sm font-medium text-rose-500">{formatCurrency(monthStats.expense)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Header */}
            <div className="flex justify-between w-full items-center">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <button
                    className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                    onClick={() => navigate('/movements')}
                >
                    View All
                </button>
            </div>

            {/* Movements List */}
            <div className="flex flex-col w-full gap-3">
                {loading ? (
                    <p className="text-center text-secondary py-8">Loading...</p>
                ) : recentMovements.length === 0 ? (
                    <p className="text-center text-secondary py-8">No movements yet.</p>
                ) : (
                    recentMovements.map((movement) => (
                        <div key={movement.id} className="card flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${movement.type?.code?.toLowerCase() === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                    {movement.type?.code?.toLowerCase() === 'income' ? (
                                        <TrendingUp size={18} className="text-emerald-500" />
                                    ) : (
                                        <TrendingDown size={18} className="text-rose-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{movement.description}</p>
                                    <p className="text-xs text-secondary">
                                        {movement.category?.description} • {format(new Date(movement.movement_date), 'MMM d')}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold ${movement.type?.code?.toLowerCase() === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                {movement.type?.code?.toLowerCase() === 'income' ? '+' : '-'}{formatCurrency(movement.amount)}
                            </span>
                        </div>
                    ))
                )}
                {/* Spacer to prevent overlapping with FAB and Bottom Nav */}
                <div style={{ height: 'calc(6rem + env(safe-area-inset-bottom))' }} />
            </div>

            {/* FAB */}
            <button
                className="btn btn-primary fixed right-4 shadow-lg flex items-center gap-2"
                style={{ zIndex: 40, bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
                onClick={() => navigate('/add-movement')}
            >
                <Plus size={20} />
                <span>Add</span>
            </button>
        </div>
    );
};
