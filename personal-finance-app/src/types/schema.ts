export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
}

export interface MovementType {
    id: number;
    code: 'income' | 'expense'; // Assuming these are the main types
    description: string;
}

export interface Category {
    id: number;
    code: string;
    description: string;
    type_id: number; // Links to MovementType
}

export interface Account {
    id: number;
    name: string;
    description?: string;
    currency_id: number;
    is_active: boolean;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
}

export interface Movement {
    id: number;
    account_id: number;
    type_id: number;
    category_id?: number;
    currency_id: number;
    amount: number;
    movement_date: string; // ISO Date string YYYY-MM-DD
    description: string;

    created_at: string;
    comment?: string;
}

// Extended interfaces for UI convenience
export interface MovementWithDetails extends Movement {
    category?: Category;
    account?: Account;
    currency?: Currency;
    type?: MovementType;
}
