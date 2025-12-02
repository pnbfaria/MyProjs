import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../lib/supabase';
import type { MovementWithDetails } from '../types/schema';
import { Search, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export const Management: React.FC = () => {
    const navigate = useNavigate();
    const [movements, setMovements] = useState<MovementWithDetails[]>([]);
    const [filteredMovements, setFilteredMovements] = useState<MovementWithDetails[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredMovements(movements);
        } else {
            const lower = search.toLowerCase();
            setFilteredMovements(
                movements.filter(m =>
                    m.description.toLowerCase().includes(lower) ||
                    m.category?.description.toLowerCase().includes(lower)
                )
            );
        }
    }, [search, movements]);

    const loadData = async () => {
        setLoading(true);
        const data = await supabaseService.getMovements();
        setMovements(data);
        setFilteredMovements(data);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this movement?')) {
            await supabaseService.deleteMovement(id);
            loadData(); // Reload to refresh list
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            <header>
                <h1 className="text-xl font-bold">Manage Movements</h1>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search movements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 pb-20">
                {loading ? (
                    <p className="text-center text-secondary py-8">Loading...</p>
                ) : filteredMovements.length === 0 ? (
                    <p className="text-center text-secondary py-8">No movements found.</p>
                ) : (
                    filteredMovements.map((movement) => (
                        <div key={movement.id} className="card p-3 flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <p className="font-medium">{movement.description}</p>
                                <p className="text-xs text-secondary">
                                    {format(new Date(movement.movement_date), 'MMM d, yyyy')} • {movement.category?.description}
                                </p>
                                <span className={`text-sm font-bold ${movement.type?.code === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                    {movement.type?.code === 'income' ? '+' : '-'}{formatCurrency(movement.amount)}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                                    onClick={() => navigate(`/edit-movement/${movement.id}`)}
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    className="p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                    onClick={() => handleDelete(movement.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

