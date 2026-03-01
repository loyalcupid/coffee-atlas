import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Credentials are missing or default, use a mock localStorage client
const isMock = !supabaseUrl || supabaseUrl === 'your_supabase_url_here'

export const supabase = isMock ? {
    from: (table: string) => ({
        insert: async (data: any[]) => {
            if (typeof window === 'undefined') return { error: null };
            const existing = JSON.parse(localStorage.getItem(table) || '[]');
            const newData = data.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));
            localStorage.setItem(table, JSON.stringify([...newData, ...existing]));
            return { error: null };
        },
        select: (query: string) => ({
            eq: (field: string, value: any) => ({
                single: async () => {
                    if (typeof window === 'undefined') return { data: null, error: null };
                    const data = JSON.parse(localStorage.getItem(table) || '[]');
                    const item = data.find((i: any) => i[field] === value);
                    return { data: item, error: item ? null : { message: 'Not found' } };
                }
            }),
            order: (field: string, { ascending }: { ascending: boolean }) => {
                if (typeof window === 'undefined') return { data: [], error: null };
                let data = JSON.parse(localStorage.getItem(table) || '[]');
                data.sort((a: any, b: any) => {
                    const valA = a[field];
                    const valB = b[field];
                    if (ascending) return valA > valB ? 1 : -1;
                    return valA < valB ? 1 : -1;
                });
                return { data, error: null };
            }
        }),
        update: (updateData: any) => ({
            eq: (field: string, value: any) => ({
                async execute() {
                    if (typeof window === 'undefined') return { error: null };
                    let data = JSON.parse(localStorage.getItem(table) || '[]');
                    data = data.map((item: any) => item[field] === value ? { ...item, ...updateData } : item);
                    localStorage.setItem(table, JSON.stringify(data));
                    return { error: null };
                }
            })
        })
    })
} as any : createClient(supabaseUrl, supabaseAnonKey);
