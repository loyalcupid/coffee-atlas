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

            // Initial data for different tables
            const initialData: Record<string, any[]> = {
                records: [
                    { id: "rec-001", name: "카페 어니언", location: "성수", rating: 5 },
                    { id: "rec-002", name: "프릳츠 커피", location: "마포", rating: 4 },
                    { id: "rec-003", name: "테라로사", location: "강릉", rating: 4 },
                    { id: "rec-004", name: "제이엠커피", location: "부산 기장군 대변3길 8", rating: 3 }
                ],
                visits: [
                    { id: "vis-001", record_id: "rec-001", date: "2026-02-22" },
                    { id: "vis-002", record_id: "rec-002", date: "2026-02-20" },
                    { id: "vis-003", record_id: "rec-003", date: "2026-02-15" },
                    { id: "vis-004", record_id: "rec-004", date: "2026-03-01" },
                ],
                orders: [
                    { id: "ord-001", visit_id: "vis-001", drink_name: "아이스 아메리카노", rating: 5, acidity: 3, body: 3, sweetness: 3, memo: "성수동의 힙한 분위기와 맛있는 커피" },
                    { id: "ord-002", visit_id: "vis-002", drink_name: "플랫 화이트", rating: 4, acidity: 3, body: 4, sweetness: 3, memo: "레트로한 감성과 훌륭한 블렌딩" },
                    { id: "ord-003", visit_id: "vis-003", drink_name: "핸드 드립", rating: 4, acidity: 4, body: 3, sweetness: 2, memo: "강릉 바다와 함께 즐기는 스페셜티 커피" },
                    { id: "ord-004", visit_id: "vis-004", drink_name: "아리차", rating: 3, acidity: 4, body: 2, sweetness: 3, memo: "약간의 산미, 약간의 가향, 플로럴 향" }
                ]
            };

            const initial = initialData[table] || [];
            let data = JSON.parse(stored || '[]');

            // --- Migration & Initialization Logic ---
            if (table === 'records') {
                const storedVisits = JSON.parse(localStorage.getItem('visits') || '[]');
                const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                let needsUpdate = false;

                // 1. Merge initial cafes if missing (by name)
                const existingNames = new Set(data.map((r: any) => r.name));
                initialData.records.forEach(initialRec => {
                    if (!existingNames.has(initialRec.name)) {
                        data.push(initialRec);
                        needsUpdate = true;

                        // Also add their initial visits/orders if they don't exist
                        const recVisits = initialData.visits.filter(v => v.record_id === initialRec.id);
                        recVisits.forEach(v => {
                            if (!storedVisits.some((sv: any) => sv.id === v.id)) {
                                storedVisits.push(v);
                                const vOrders = initialData.orders.filter(o => o.visit_id === v.id);
                                vOrders.forEach(o => {
                                    if (!storedOrders.some((so: any) => so.id === o.id)) {
                                        storedOrders.push(o);
                                    }
                                });
                            }
                        });
                    }
                });

                // 2. Scan for old format records and migrate them
                const migratedVisits = [...storedVisits];
                const migratedOrders = [...storedOrders];

                data = data.map((record: any) => {
                    const hasOldData = record.date || record.drink;
                    const hasVisit = migratedVisits.some(v => v.record_id === record.id);

                    if (hasOldData && !hasVisit) {
                        const visitId = `mig-vis-${Math.random().toString(36).substr(2, 5)}`;
                        const orderId = `mig-ord-${Math.random().toString(36).substr(2, 5)}`;

                        migratedVisits.push({
                            id: visitId,
                            record_id: record.id,
                            date: record.date || new Date().toISOString().split('T')[0]
                        });

                        migratedOrders.push({
                            id: orderId,
                            visit_id: visitId,
                            drink_name: record.drink || "이름 없는 커피",
                            rating: record.rating || 3,
                            acidity: record.acidity || 3,
                            body: record.body || 3,
                            sweetness: record.sweetness || 3,
                            memo: record.memo || ""
                        });

                        // Strip old fields from record to complete migration
                        const { date, drink, memo, acidity, body, sweetness, ...newRecord } = record;
                        needsUpdate = true;
                        return newRecord;
                    }
                    return record;
                });

                if (needsUpdate) {
                    console.log('Migrating/Merging records list:', data);
                    localStorage.setItem('records', JSON.stringify(data));
                    localStorage.setItem('visits', JSON.stringify(migratedVisits));
                    localStorage.setItem('orders', JSON.stringify(migratedOrders));
                }
            } else if (data.length === 0 && initial.length > 0) {
                data = initial;
                localStorage.setItem(table, JSON.stringify(data));
            }

            console.log(`[Supabase Mock] Table: ${table}, Data Count: ${data.length}`);
            return data;
        };

        return {
            insert: async (dataToInsert: any[]) => {
                if (typeof window === 'undefined') return { error: null };
                const existing = getStoredData();
                const newData = dataToInsert.map(item => ({
                    ...item,
                    id: item.id || Math.random().toString(36).substr(2, 9)
                }));
                localStorage.setItem(table, JSON.stringify([...newData, ...existing]));
                console.log(`[Supabase Mock] Insert into ${table}:`, newData);
                return { data: newData, error: null };
            },
            select: (query: string = '*') => {
                const chain = {
                    eq: (field: string, value: any) => {
                        const allData = getStoredData();
                        const filteredData = allData.filter((i: any) => i[field] === value);
                        console.log(`[Supabase Mock] Select ${table} where ${field} === ${value}. Found: ${filteredData.length}`);
                        const subChain = {
                            single: async () => {
                                if (typeof window === 'undefined') return { data: null, error: null };
                                const item = filteredData[0];
                                if (!item) console.warn(`[Supabase Mock] ${table} record not found with ${field}=${value}`);
                                return { data: item, error: item ? null : { message: 'Not found' } };
                            },
                            execute: async () => {
                                if (typeof window === 'undefined') return { data: [], error: null };
                                return { data: filteredData, error: null };
                            },
                            order: (orderField: string, { ascending }: { ascending: boolean }) => ({
                                execute: async () => {
                                    if (typeof window === 'undefined') return { data: [], error: null };
                                    const sorted = [...filteredData].sort((a: any, b: any) => {
                                        const valA = a[orderField];
                                        const valB = b[orderField];
                                        if (!valA) return 1;
                                        if (!valB) return -1;
                                        if (ascending) return valA > valB ? 1 : -1;
                                        return valA < valB ? 1 : -1;
                                    });
                                    return { data: sorted, error: null };
                                }
                            })
                        };
                        return subChain;
                    },
                    order: (field: string, { ascending }: { ascending: boolean }) => ({
                        execute: async () => {
                            if (typeof window === 'undefined') return { data: [], error: null };
                            let data = getStoredData();
                            data.sort((a: any, b: any) => {
                                const valA = a[field];
                                const valB = b[field];
                                if (!valA) return 1;
                                if (!valB) return -1;
                                if (ascending) return valA > valB ? 1 : -1;
                                return valA < valB ? 1 : -1;
                            });
                            return { data, error: null };
                        }
                    }),
                    execute: async () => {
                        if (typeof window === 'undefined') return { data: [], error: null };
                        const data = getStoredData();
                        console.log(`[Supabase Mock] Select * from ${table}. Returning ${data.length} records.`);
                        return { data, error: null };
                    }
                };
                return chain;
            },
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
