"use client";

import { useState } from "react";
import { Coffee, MapPin, Calendar, Star, Send, Camera } from "lucide-react";
import Link from "next/link";

export default function AddRecord() {
    const [rating, setRating] = useState(3);
    const [acidity, setAcidity] = useState(3);
    const [body, setBody] = useState(3);
    const [sweetness, setSweetness] = useState(3);

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-coffee-brown">커피 기록하기</h1>
                    <Link href="/dashboard" className="text-coffee-brown/50 hover:text-coffee-brown transition-colors">
                        취소
                    </Link>
                </div>

                <form className="coffee-card space-y-8 bg-white/80 backdrop-blur-sm">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown flex items-center gap-2">
                                <Coffee size={16} /> 카페 이름
                            </label>
                            <input
                                type="text"
                                placeholder="어느 카페에 방문하셨나요?"
                                className="w-full px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown flex items-center gap-2">
                                <MapPin size={16} /> 위치
                            </label>
                            <input
                                type="text"
                                placeholder="예: 서울 마포구 연남동"
                                className="w-full px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown flex items-center gap-2">
                                <Calendar size={16} /> 방문 날짜
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown flex items-center gap-2">
                                <Star size={16} /> 드신 음료
                            </label>
                            <input
                                type="text"
                                placeholder="예: 아이스 아메리카노"
                                className="w-full px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <hr className="border-coffee-brown/5" />

                    {/* Sensory Profile */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-coffee-brown flex items-center gap-2">
                            맛 프로파일 <span className="text-xs font-normal text-coffee-brown/50">(1~5점)</span>
                        </h3>

                        <div className="space-y-8">
                            <RangeSlider label="산미 (Acidity)" value={acidity} onChange={setAcidity} />
                            <RangeSlider label="바디감 (Body)" value={body} onChange={setBody} />
                            <RangeSlider label="단맛 (Sweetness)" value={sweetness} onChange={setSweetness} />
                        </div>
                    </div>

                    <hr className="border-coffee-brown/5" />

                    {/* Rating & Memo */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown">총평 (Rating)</label>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRating(s)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${rating >= s ? "bg-coffee-accent text-coffee-brown shadow-md" : "bg-coffee-brown/5 text-coffee-brown/20"
                                            }`}
                                    >
                                        <Star size={20} fill={rating >= s ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown">메모</label>
                            <textarea
                                placeholder="커피의 향, 카페의 분위기 등 기억하고 싶은 내용을 적어주세요."
                                className="w-full h-32 px-4 py-3 rounded-xl border border-coffee-brown/10 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/20 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-coffee-brown flex items-center gap-2">
                                <Camera size={16} /> 사진 (선택)
                            </label>
                            <div className="w-full h-40 border-2 border-dashed border-coffee-brown/10 rounded-xl flex flex-col items-center justify-center text-coffee-brown/30 hover:bg-coffee-brown/5 transition-all cursor-pointer">
                                <Camera size={32} />
                                <p className="text-sm mt-2">클릭하여 사진을 업로드하세요</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-coffee-brown text-coffee-cream py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-coffee-brown/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Send size={20} /> 기록 완료하기
                    </button>
                </form>
            </div>
        </div>
    );
}

function RangeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-coffee-brown/70">{label}</label>
                <span className="text-sm font-bold text-coffee-brown">{value}점</span>
            </div>
            <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-coffee-brown/10 rounded-lg appearance-none cursor-pointer accent-coffee-brown"
            />
        </div>
    );
}
