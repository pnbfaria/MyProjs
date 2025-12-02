// @ts-ignore
import { createClient } from '@supabase/supabase-js';
import type { Movement, Category, MovementWithDetails, Account, MovementType, Currency } from '../types/schema';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
    async getMovements(): Promise<MovementWithDetails[]> {
        const { data, error } = await supabase
            .from('movements')
            .select(`
                *,
                category:categories(*),
                account:accounts(*),
                type:movement_types(*),
                currency:currencies(*)
            `)
            .order('movement_date', { ascending: false });

        if (error) {
            console.error('Error fetching movements:', error);
            throw error;
        }

        return data as MovementWithDetails[];
    },

    async getRecentMovements(limit: number = 5): Promise<MovementWithDetails[]> {
        const { data, error } = await supabase
            .from('movements')
            .select(`
                *,
                category:categories(*),
                account:accounts(*),
                type:movement_types(*),
                currency:currencies(*)
            `)
            .order('movement_date', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent movements:', error);
            throw error;
        }

        return data as MovementWithDetails[];
    },

    async getMonthBalance(month: number, year: number): Promise<{ income: number, expense: number, total: number }> {
        // Calculate start and end of the month in YYYY-MM-DD format
        // Note: month is 0-indexed
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);

        // Format as YYYY-MM-DD to match Supabase date column (assuming it's a date column)
        // We use local time to avoid timezone shifts affecting the date
        const formatDate = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const startDate = formatDate(start);
        const endDate = formatDate(end);

        console.log(`Fetching balance for range: ${startDate} to ${endDate}`);

        const { data, error } = await supabase
            .from('movements')
            .select(`
                amount,
                type:movement_types!inner(code)
            `)
            .gte('movement_date', startDate)
            .lte('movement_date', endDate);

        if (error) {
            console.error('Error fetching month balance:', error);
            throw error;
        }

        console.log('Month balance data:', data);

        let income = 0;
        let expense = 0;

        data.forEach((m: any) => {
            const code = m.type?.code?.toLowerCase();
            if (code === 'income') {
                income += m.amount;
            } else if (code === 'expense') {
                expense += m.amount;
            }
        });

        return { income, expense, total: income - expense };
    },

    async addMovement(movement: Omit<Movement, 'id' | 'created_at'>): Promise<Movement> {
        const { data, error } = await supabase
            .from('movements')
            .insert([movement])
            .select()
            .single();

        if (error) {
            console.error('Error adding movement:', error);
            throw error;
        }

        return data as Movement;
    },

    async updateMovement(id: number, movement: Partial<Omit<Movement, 'id' | 'created_at'>>): Promise<Movement> {
        const { data, error } = await supabase
            .from('movements')
            .update(movement)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating movement:', error);
            throw error;
        }

        return data as Movement;
    },

    async deleteMovement(id: number): Promise<void> {
        const { error } = await supabase
            .from('movements')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting movement:', error);
            throw error;
        }
    },

    async getCategories(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('description');
        if (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
        return data as Category[];
    },

    async getAccounts(): Promise<Account[]> {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('is_active', true)
            .order('name');
        if (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
        return data as Account[];
    },


    async getMovementTypes(): Promise<MovementType[]> {
        const { data, error } = await supabase
            .from('movement_types')
            .select('*')
            .order('code');
        if (error) {
            console.error('Error fetching movement types:', error);
            throw error;
        }
        return data as MovementType[];
    },

    async getCurrencies(): Promise<Currency[]> {
        const { data, error } = await supabase
            .from('currencies')
            .select('*')
            .order('code');
        if (error) {
            console.error('Error fetching currencies:', error);
            throw error;
        }
        return data as Currency[];
    },

};
