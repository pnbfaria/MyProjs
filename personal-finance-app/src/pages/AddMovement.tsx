import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, DollarSign, FileText } from 'lucide-react';
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
            if (categoryId !== '' && categoryId !== undefined) {
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
        <div className="flex flex-col h-screen bg-primary text-primary">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-slate-800">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-800">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">{isEditing ? 'Edit Movement' : 'Add Movement'}</h1>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {/* Amount */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium">Amount</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Type selector */}
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isTypeSelected('expense') ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => {
                            const id = getTypeId('expense');
                            if (id) setTypeId(id);
                        }}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isTypeSelected('income') ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
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
                    <label className="text-sm text-secondary font-medium">Description</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="What is this for?"
                        />
                    </div>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium">Category</label>
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="" disabled>Select Category</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.description}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Account */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium">Account</label>
                    <select
                        value={accountId}
                        onChange={e => {
                            const accId = Number(e.target.value);
                            setAccountId(accId);
                            const acc = accounts.find(a => a.id === accId);
                            if (acc) setCurrencyId(acc.currency_id);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="" disabled>Select Account</option>
                        {accounts.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name}{a.description ? ` (${a.description})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Currency */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-secondary font-medium">Currency</label>
                    <select
                        value={currencyId}
                        onChange={e => setCurrencyId(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="" disabled>Select Currency</option>
                        {currencies.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.code} - {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </form>

            {/* Save button */}
            <div className="p-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
                >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Movement'}</span>
                </button>
            </div>
        </div>
    );
};
