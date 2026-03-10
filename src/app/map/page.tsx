"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Coffee, Star, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components as they require 'window'
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

interface CafeRecord {
    id: string;
    name: string;
    location: string;
    rating: number;
    drink: string;
    lat?: number;
    lng?: number;
}

export default function MapPage() {
    const [records, setRecords] = useState<CafeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [geocoding, setGeocoding] = useState(false);
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        // Load Leaflet on client side to get icons working
        import("leaflet").then((leaflet) => {
            setL(leaflet);
            // Fix default icon issue in Leaflet with Webpack/Next.js
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });
        });

        const fetchData = async () => {
            try {
                // We need to call .order() or another method for the mock client to return data
                const { data, error } = await supabase
                    .from("records")
                    .select("*")
                    .order('date', { ascending: false });

                if (error) throw error;

                const rawRecords = data || [];
                console.log("Fetched records from Supabase/Mock:", rawRecords.length);
                setRecords(rawRecords);
                setGeocoding(true);

                // Geocode addresses
                const geocodedRecords = await Promise.all(
                    rawRecords.map(async (record: CafeRecord, index: number) => {
                        if (!record.location) return record;

                        // Add a delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, index * 1200));

                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(record.location)}&limit=1`,
                                {
                                    headers: {
                                        'User-Agent': 'CoffeeAtlas/1.0'
                                    }
                                }
                            );
                            const result = await response.json();
                            if (result && result.length > 0) {
                                return {
                                    ...record,
                                    lat: parseFloat(result[0].lat),
                                    lng: parseFloat(result[0].lon)
                                };
                            }
                        } catch (err) {
                            console.error(`Geocoding failed for ${record.name}:`, err);
                        }
                        return record;
                    })
                );

                const finalRecords = geocodedRecords.filter(r => r.lat && r.lng);
                console.log("Total geocoded records:", finalRecords.length);
                setRecords(finalRecords);
            } catch (error) {
                console.error("Error fetching or geocoding records:", error);
            } finally {
                setLoading(false);
                setGeocoding(false);
            }
        };

        fetchData();
    }, []);

    // Find center point from records or default to Seoul
    const mapCenter: [number, number] = records.length > 0 && records[0].lat && records[0].lng
        ? [records[0].lat, records[0].lng]
        : [37.5665, 126.9780];

    return (
        <div className="min-h-screen bg-coffee-cream/30 flex flex-col">
            {/* Header */}
            <div className="p-6 md:px-12 bg-white/50 backdrop-blur-md border-b border-coffee-brown/10 flex items-center justify-between z-[1000]">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-coffee-brown/5 rounded-full transition-colors text-coffee-brown">
                        <Home size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-coffee-brown">나의 카페 지도</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/add-record" className="bg-coffee-brown text-coffee-cream px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-coffee-brown/90 transition-all">
                        기록 추가
                    </Link>
                    <Link href="/records" className="text-coffee-brown/60 hover:text-coffee-brown font-medium text-sm">
                        목록보기
                    </Link>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0" style={{ height: "calc(100vh - 100px)", width: "100%" }}>
                {geocoding && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-[2000] flex items-center gap-2 border border-coffee-brown/10">
                        <div className="animate-spin w-4 h-4 border-2 border-coffee-brown border-t-transparent rounded-full"></div>
                        <span className="text-sm font-medium text-coffee-brown">주소 변환 중...</span>
                    </div>
                )}

                {loading && records.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-coffee-cream/50 z-[3000]">
                        <div className="animate-spin w-12 h-12 border-4 border-coffee-brown border-t-transparent rounded-full mb-4"></div>
                        <p className="text-coffee-brown font-medium text-lg">지도를 불러오는 중...</p>
                    </div>
                ) : null}

                {typeof window !== "undefined" && L && (
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {records.map((record) => (
                            record.lat && record.lng && (
                                <Marker key={record.id} position={[record.lat, record.lng]}>
                                    <Popup>
                                        <div className="p-2 min-w-[150px]">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-coffee-brown text-base m-0">{record.name}</h3>
                                                <span className="flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                                                    <Star size={10} fill="currentColor" className="mr-0.5" /> {record.rating}
                                                </span>
                                            </div>
                                            <p className="text-xs text-coffee-brown/60 m-0 mb-2">{record.drink}</p>
                                            <div className="text-[10px] text-coffee-brown/40 flex items-center gap-1">
                                                <MapPin size={10} /> {record.location}
                                            </div>
                                            <Link
                                                href={`/records/${record.id}`}
                                                className="mt-3 block text-center bg-coffee-brown text-white text-xs py-1.5 rounded hover:bg-coffee-brown/90 transition-colors no-underline"
                                            >
                                                상세보기
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
