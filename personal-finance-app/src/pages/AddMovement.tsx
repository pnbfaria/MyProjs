import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, FileText, ChevronDown } from 'lucide-react';
import { supabaseService } from '../lib/supabase';
import type { Category, Account, Currency, MovementType } from '../types/schema';

export const AddMovement: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    // Form state
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [typeId, setTypeId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [accountId, setAccountId] = useState<number | ''>('');
    const [currencyId, setCurrencyId] = useState<number>(1);

    // Dropdown data
    const [categories, setCategories] = useState<Category[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [movementTypes, setMovementTypes] = useState<MovementType[]>([]);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load dropdown data and, if editing, the movement details
    useEffect(() => {
        const load = async () => {
            setInitialLoading(true);
            try {
                const [cats, accs, cur, types] = await Promise.all([
                    supabaseService.getCategories(),
                    supabaseService.getAccounts(),
                    supabaseService.getCurrencies(),
                    supabaseService.getMovementTypes(),
                ]);
                setCategories(cats);
                setAccounts(accs);
                setCurrencies(cur);
                setMovementTypes(types);

                // Find IDs for expense and income
                const expenseType = types.find(t => t.code.toLowerCase() === 'expense');

                // Default to expense if available, otherwise first type
                let defaultTypeId = expenseType?.id || types[0]?.id;

                // defaults for new movement
                if (!isEditing && accs.length > 0) {
                    setAccountId(accs[0].id);
                    setCurrencyId(accs[0].currency_id);
                }
                if (!isEditing && defaultTypeId) {
                    setTypeId(defaultTypeId);
                }

                // editing: fetch movement by id
                if (isEditing && id) {
                    const all = await supabaseService.getMovements();
                    const mov = all.find(m => m.id === Number(id));
                    if (mov) {
                        setAmount(mov.amount.toString());
                        setDescription(mov.description);
                        setDate(mov.movement_date.split('T')[0]);
                        setTypeId(mov.type_id);
                        setCategoryId(mov.category_id ?? '');
                        setAccountId(mov.account_id);
                        setCurrencyId(mov.currency_id);
                    }
                }
            } catch (e) {
                console.error('Error loading data', e);
                alert('Failed to load data');
            } finally {
                setInitialLoading(false);
            }
        };
        load();
    }, [isEditing, id]);

    const getTypeId = (code: string) => {
        return movementTypes.find(t => t.code.toLowerCase() === code.toLowerCase())?.id;
    };

    const isTypeSelected = (code: string) => {
        const id = getTypeId(code);
        return id === typeId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || categoryId === '' || accountId === '' || !date || !typeId) {
            alert('Please fill in all required fields');
            return;
        }
        setLoading(true);
        try {
            const payload: any = {
                amount: parseFloat(amount),
                description,
                movement_date: new Date(date).toISOString(),
                type_id: typeId,
                account_id: Number(accountId),
                currency_id: currencyId,
            };
            if (typeof categoryId === 'number') {
                payload.category_id = Number(categoryId);
            }
            if (isEditing && id) {
                await supabaseService.updateMovement(Number(id), payload);
            } else {
                await supabaseService.addMovement(payload);
            }
            navigate('/');
        } catch (err) {
            console.error('Error saving movement:', err);
            alert('Failed to save movement');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen text-primary" style={{ backgroundImage: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)' }}>
            {/* Header */}
            <header className="flex items-center gap-4 p-4" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-full hover:bg-slate-800/50 transition-colors bg-white/5 backdrop-blur-md border border-white/5"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{isEditing ? 'Edit Movement' : 'Add Movement'}</h1>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {/* Amount */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Amount</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl py-6 px-4 text-4xl font-bold text-center text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Type selector */}
                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <button
                        type="button"
                        className={`flex-1 py-4 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${isTypeSelected('expense')
                                ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transform scale-[1.02]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => {
                            const id = getTypeId('expense');
                            if (id) setTypeId(id);
                        }}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-4 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${isTypeSelected('income')
                                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transform scale-[1.02]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        onClick={() => {
                            const id = getTypeId('income');
                            if (id) setTypeId(id);
                        }}
                    >
                        Income
                    </button>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Description</label>
                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                            placeholder="What is this for?"
                        />
                    </div>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Category</label>
                    <div className="relative">
                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(Number(e.target.value))}
                            className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.description}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Account */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Account</label>
                    <div className="relative">
                        <select
                            value={accountId}
                            onChange={e => {
                                const accId = Number(e.target.value);
                                setAccountId(accId);
                                const acc = accounts.find(a => a.id === accId);
                                if (acc) setCurrencyId(acc.currency_id);
                            }}
                            className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="" disabled>Select Account</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name}{a.description ? ` (${a.description})` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Currency */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium pl-1">Currency</label>
                    <div className="relative">
                        <select
                            value={currencyId}
                            onChange={e => setCurrencyId(Number(e.target.value))}
                            className="w-full bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-4 pr-10 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="" disabled>Select Currency</option>
                            {currencies.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.code} - {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <div className="h-8" />
            </form>

            {/* Save button */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg shadow-xl"
                >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Movement'}</span>
                </button>
            </div>
        </div>
    );
};
