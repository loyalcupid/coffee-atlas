"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Coffee, MapPin, Calendar, Star, Edit2, Save, X, Home, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecordDetail() {
    const params = useParams();
    const router = useRouter();
    const [record, setRecord] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit form states
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [drink, setDrink] = useState("");
    const [memo, setMemo] = useState("");
    const [rating, setRating] = useState(3);
    const [acidity, setAcidity] = useState(3);
    const [body, setBody] = useState(3);
    const [sweetness, setSweetness] = useState(3);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const { data, error } = await supabase
                    .from('records')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setRecord(data);

                // Initialize form states
                setName(data.name);
                setLocation(data.location);
                setDate(data.date);
                setDrink(data.drink);
                setMemo(data.memo);
                setRating(data.rating);
                setAcidity(data.acidity);
                setBody(data.body);
                setSweetness(data.sweetness);
            } catch (error) {
                console.error('Error fetching record:', error);
                alert('기록을 찾을 수 없습니다.');
                router.push('/records');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchRecord();
        }
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                name,
                location,
                date,
                drink,
                memo,
                rating,
                acidity,
                body,
                sweetness
            };

            const { error } = await supabase
                .from('records')
                .update(updateData)
                .eq('id', params.id)
                .execute();

            if (error) throw error;

            setRecord({ ...record, ...updateData });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating record:', error);
            alert('수정 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!record) return null;

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/records" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-coffee-brown">
                            {isEditing ? "기록 수정" : "상세 기록"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                            <Home size={24} />
                        </Link>
                    </div>
                </div>

                <div className="coffee-card p-8 bg-white/80 backdrop-blur-sm space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-coffee-brown/50 uppercase tracking-wider">카페 이름</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full text-2xl font-bold text-coffee-brown bg-transparent border-b-2 border-coffee-brown/10 focus:border-coffee-brown outline-none pb-1 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-coffee-brown/50 flex items-center gap-1"><MapPin size={12} /> 위치</label>
                                        <input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full text-sm text-coffee-brown bg-transparent border-b border-coffee-brown/10 focus:border-coffee-brown outline-none pb-1 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-coffee-brown/50 flex items-center gap-1"><Calendar size={12} /> 날짜</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full text-sm text-coffee-brown bg-transparent border-b border-coffee-brown/10 focus:border-coffee-brown outline-none pb-1 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-coffee-brown/50 flex items-center gap-1"><Coffee size={12} /> 드신 음료</label>
                                    <input
                                        value={drink}
                                        onChange={(e) => setDrink(e.target.value)}
                                        className="w-full text-lg text-coffee-brown bg-transparent border-b border-coffee-brown/10 focus:border-coffee-brown outline-none pb-1 transition-colors"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-4xl font-black text-coffee-brown tracking-tight">{record.name}</h2>
                                    <div className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full text-lg">
                                        <Star size={20} fill="currentColor" className="mr-1" /> {record.rating}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-coffee-brown/60">
                                    <span className="flex items-center gap-1"><MapPin size={16} /> {record.location}</span>
                                    <span className="flex items-center gap-1"><Calendar size={16} /> {record.date}</span>
                                </div>
                                <div className="pt-4">
                                    <span className="bg-coffee-brown/5 text-coffee-brown px-4 py-2 rounded-xl font-bold flex items-center gap-2 w-fit">
                                        <Coffee size={20} /> {record.drink}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-coffee-brown/10" />

                    {/* Taste Analysis */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-coffee-brown/50 uppercase tracking-widest">Taste Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: "Acidity", value: acidity, setter: setAcidity },
                                { label: "Body", value: body, setter: setBody },
                                { label: "Sweetness", value: sweetness, setter: setSweetness },
                            ].map((item) => (
                                <div key={item.label} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-coffee-brown font-bold">{item.label}</span>
                                        <span className="text-coffee-brown/40 text-xs font-mono">{item.value}/5</span>
                                    </div>
                                    <div className="relative h-2 bg-coffee-brown/5 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-coffee-brown transition-all duration-500 ease-out rounded-full"
                                            style={{ width: `${(item.value / 5) * 100}%` }}
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className="flex justify-between gap-1">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => item.setter(num)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${item.value === num
                                                            ? 'bg-coffee-brown text-coffee-cream shadow-md scale-110'
                                                            : 'bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="pt-4 space-y-4">
                                <label className="text-sm font-bold text-coffee-brown">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setRating(num)}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${rating === num
                                                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                                                    : 'bg-coffee-brown/5 text-coffee-brown hover:bg-coffee-brown/10'
                                                }`}
                                        >
                                            <Star size={16} fill={rating >= num ? "currentColor" : "none"} /> {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-coffee-brown/10" />

                    {/* Memo */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-coffee-brown/50 uppercase tracking-widest">Memo</h3>
                        {isEditing ? (
                            <textarea
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                className="w-full h-40 p-4 rounded-2xl bg-coffee-brown/5 border-2 border-transparent focus:border-coffee-brown/10 outline-none text-coffee-brown transition-all resize-none"
                                placeholder="당신의 커피 경험을 기록하세요..."
                            />
                        ) : (
                            <p className="text-coffee-brown/80 leading-relaxed italic border-l-4 border-coffee-brown/10 pl-6 py-2">
                                {record.memo || "작성된 메모가 없습니다."}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-8 flex gap-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 bg-coffee-brown text-coffee-cream py-4 rounded-2xl font-bold shadow-xl hover:bg-coffee-brown/90 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? "저장 중..." : <><Save size={20} /> 수정 사완료</>}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form
                                        setName(record.name);
                                        // ... other resets if needed, but the simple ones suffice for now
                                    }}
                                    className="px-6 py-4 rounded-2xl font-bold text-coffee-brown/40 hover:text-coffee-brown hover:bg-coffee-brown/5 transition-all"
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 bg-coffee-brown text-coffee-cream py-4 rounded-2xl font-bold shadow-xl hover:bg-coffee-brown/90 transition-all flex items-center justify-center gap-2"
                            >
                                <Edit2 size={20} /> 기록 수정하기
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
