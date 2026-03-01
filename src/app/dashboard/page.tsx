"use client";

import { useEffect, useState } from "react";
import { Coffee, TrendingUp, DollarSign, Star, MoreVertical, Home } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVisits: 12,
        monthlyVisits: 4,
        totalSpent: 68500,
        avgRating: 4.2,
    });

    return (
        <div className="min-h-screen bg-coffee-cream/30 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                                <Home size={24} />
                            </Link>
                            <h1 className="text-3xl font-bold text-coffee-brown">Dashboard</h1>
                        </div>
                        <p className="text-coffee-brown/60 pt-2">환영합니다! 이번 달에도 커피와 함께 즐거운 시간 보내셨나요?</p>
                    </div>
                    <Link href="/add-record" className="bg-coffee-brown text-coffee-cream px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                        기록 추가하기
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<Coffee className="text-coffee-brown" />}
                        label="총 방문 횟수"
                        value={`${stats.totalVisits}회`}
                    />
                    <StatCard
                        icon={<TrendingUp className="text-coffee-accent" />}
                        label="이번 달 방문"
                        value={`${stats.monthlyVisits}회`}
                    />
                    <StatCard
                        icon={<DollarSign className="text-green-600" />}
                        label="총 소비 금액"
                        value={`${stats.totalSpent.toLocaleString()}원`}
                    />
                    <StatCard
                        icon={<Star className="text-yellow-500" />}
                        label="평균 평점"
                        value={`${stats.avgRating} / 5.0`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Taste Analysis */}
                    <div className="lg:col-span-2 coffee-card space-y-6">
                        <h2 className="text-2xl font-bold text-coffee-brown">취향 분석 (Taste Profile)</h2>
                        <div className="h-64 bg-coffee-brown/5 rounded-xl flex items-center justify-center border-2 border-dashed border-coffee-brown/10">
                            <p className="text-coffee-brown/40">차트 준비 중... (Chart.js 통합 예정)</p>
                        </div>
                        <div className="p-4 bg-coffee-brown text-coffee-cream rounded-xl">
                            <p className="font-bold text-lg">당신은 "산미 선호형"입니다!</p>
                            <p className="text-coffee-cream/70 text-sm">최근 기록 10개 중 7개에서 높은 산미를 선호하셨네요.</p>
                        </div>
                    </div>

                    {/* Recent Records */}
                    <div className="coffee-card space-y-6">
                        <h2 className="text-2xl font-bold text-coffee-brown">최근 기록</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-coffee-brown/5 rounded-lg transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-coffee-accent/20 rounded-lg flex items-center justify-center">
                                            <Coffee size={20} className="text-coffee-brown" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-coffee-brown">카페 어니언</p>
                                            <p className="text-xs text-coffee-brown/50">2026.02.2{i}</p>
                                        </div>
                                    </div>
                                    <MoreVertical size={16} className="text-coffee-brown/30 group-hover:text-coffee-brown transition-colors" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2 text-coffee-brown/60 text-sm hover:text-coffee-brown transition-colors">
                            전체 보기 →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="coffee-card flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center border border-coffee-brown/5">
                {icon}
            </div>
            <div>
                <p className="text-sm text-coffee-brown/50 font-medium">{label}</p>
                <p className="text-xl font-bold text-coffee-brown">{value}</p>
            </div>
        </div>
    );
}
