import { supabase } from './supabase';

export type Product = {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  image_url?: string;
};

export type Batch = {
  id: string;
  batch_date: string;
  quota: number;
  menus?: Record<string, number>;
  is_open: boolean;
};

export type OrderItem = {
  product_id: string;
  quantity: number;
};

export type Order = {
  id: string;
  customer_name: string;
  wa_number: string;
  instagram?: string;
  batch_id: string;
  items: OrderItem[];
  total_price: number;
  payment_method: 'COD' | 'Transfer';
  proof_url?: string;
  status: 'pending' | 'confirmed' | 'done';
  delivery_address?: string;
  created_at?: string;
};

export type Expense = {
  id: string;
  amount: number;
  note: string;
  created_at: string;
};

// Database Operations with real Supabase client
export const db = {
  products: {
    getOptions: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
      if (error) console.error('Supabase Error:', error);
      return data || [];
    },
    getAll: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Supabase Error:', error);
      return data || [];
    },
    toggleActive: async (id: string, is_active: boolean) => {
      await supabase.from('products').update({ is_active }).eq('id', id);
    }
  },
  batches: {
    getActive: async (): Promise<Batch | undefined> => {
      const { data, error } = await supabase.from('batches').select('*').eq('is_open', true).maybeSingle();
      if (error) console.error('Supabase Error:', error);
      return data || undefined;
    },
    getAll: async (): Promise<Batch[]> => {
      const { data, error } = await supabase.from('batches').select('*').order('batch_date', { ascending: false });
      if (error) console.error('Supabase Error:', error);
      return data || [];
    },
    update: async (id: string, updates: Partial<Batch>) => {
      await supabase.from('batches').update(updates).eq('id', id);
    }
  },
  orders: {
    create: async (orderData: Omit<Order, 'id' | 'status'>) => {
      const { data, error } = await supabase.from('orders').insert([{
        ...orderData,
        status: 'pending'
      }]).select().single();
      if (error) throw error;
      return data;
    },
    getAll: async (): Promise<Order[]> => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) console.error('Supabase Error:', error);
      return data || [];
    },
    updateStatus: async (id: string, status: Order['status']) => {
      await supabase.from('orders').update({ status }).eq('id', id);
    }
  },
  expenses: {
    getAll: async (): Promise<Expense[]> => {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (error) console.error('Supabase Error:', error);
      return data || [];
    },
    create: async (expenseData: Omit<Expense, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('expenses').insert([expenseData]).select().single();
      if (error) throw error;
      return data;
    }
  }
};
