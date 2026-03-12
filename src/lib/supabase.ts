import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Credentials are missing or default, use a mock localStorage client
const isMock = !supabaseUrl || supabaseUrl === 'your_supabase_url_here'

export const supabase = isMock ? {
    from: (table: string) => {
        const getStoredData = () => {
            if (typeof window === 'undefined') return [];
            const stored = localStorage.getItem(table);
            const initial = table === 'records' ? [
                {
                    id: "rec-001",
                    name: "카페 어니언",
                    location: "성수",
                    date: "2026-02-22",
                    drink: "아이스 아메리카노",
                    rating: 5,
                    acidity: 3,
                    body: 3,
                    sweetness: 3,
                    memo: "성수동의 힙한 분위기와 맛있는 커피"
                },
                {
                    id: "rec-002",
                    name: "프릳츠 커피",
                    location: "마포",
                    date: "2026-02-20",
                    drink: "플랫 화이트",
                    rating: 4,
                    acidity: 3,
                    body: 4,
                    sweetness: 3,
                    memo: "레트로한 감성과 훌륭한 블렌딩"
                },
                {
                    id: "rec-003",
                    name: "테라로사",
                    location: "강릉",
                    date: "2026-02-15",
                    drink: "핸드 드립",
                    rating: 4,
                    acidity: 4,
                    body: 3,
                    sweetness: 2,
                    memo: "강릉 바다와 함께 즐기는 스페셜티 커피"
                },
                {
                    id: "rec-004",
                    name: "제이엠커피",
                    location: "부산 기장군 대변3길 8",
                    date: "2026-03-01",
                    drink: "아리차",
                    rating: 3,
                    acidity: 4,
                    body: 2,
                    sweetness: 3,
                    memo: "약간의 산미, 약간의 가향, 플로럴 향"
                }
            ] : [];

            let data = JSON.parse(stored || '[]');

            // Merge initial records if they don't exist in data (by name)
            if (table === 'records') {
                const existingNames = new Set(data.map((r: any) => r.name));
                const missing = initial.filter(r => !existingNames.has(r.name));
                if (missing.length > 0) {
                    data = [...data, ...missing];
                    localStorage.setItem(table, JSON.stringify(data));
                }
            }

            return data;
        };

        return {
            insert: async (data: any[]) => {
                if (typeof window === 'undefined') return { error: null };
                const existing = getStoredData();
                const newData = data.map(item => ({
                    ...item,
                    id: item.id || Math.random().toString(36).substr(2, 9)
                }));
                localStorage.setItem(table, JSON.stringify([...newData, ...existing]));
                return { error: null };
            },
            select: (query: string) => ({
                eq: (field: string, value: any) => ({
                    single: async () => {
                        if (typeof window === 'undefined') return { data: null, error: null };
                        const data = getStoredData();
                        const item = data.find((i: any) => i[field] === value);
                        return { data: item, error: item ? null : { message: 'Not found' } };
                    },
                    execute: async () => {
                        if (typeof window === 'undefined') return { data: [], error: null };
                        const data = getStoredData();
                        return { data: data.filter((i: any) => i[field] === value), error: null };
                    }
                }),
                order: (field: string, { ascending }: { ascending: boolean }) => {
                    if (typeof window === 'undefined') return { data: [], error: null };
                    let data = getStoredData();
                    data.sort((a: any, b: any) => {
                        const valA = a[field];
                        const valB = b[field];
                        if (ascending) return valA > valB ? 1 : -1;
                        return valA < valB ? 1 : -1;
                    });
                    return { data, error: null };
                },
                execute: async () => {
                    if (typeof window === 'undefined') return { data: [], error: null };
                    return { data: getStoredData(), error: null };
                }
            }),
            update: (updateData: any) => ({
                eq: (field: string, value: any) => ({
                    async execute() {
                        if (typeof window === 'undefined') return { error: null };
                        let data = getStoredData();
                        data = data.map((item: any) => item[field] === value ? { ...item, ...updateData } : item);
                        localStorage.setItem(table, JSON.stringify(data));
                        return { error: null };
                    }
                })
            }),
            delete: () => ({
                eq: (field: string, value: any) => ({
                    async execute() {
                        if (typeof window === 'undefined') return { error: null };
                        let data = getStoredData();
                        data = data.filter((item: any) => item[field] !== value);
                        localStorage.setItem(table, JSON.stringify(data));
                        return { error: null };
                    }
                })
            })
        };
    }
} as any : createClient(supabaseUrl, supabaseAnonKey);
