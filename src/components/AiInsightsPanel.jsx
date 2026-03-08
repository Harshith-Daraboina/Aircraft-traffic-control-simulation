"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, CloudLightning, Plane, BrainCircuit } from 'lucide-react';

const AiInsightsPanel = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);

    const fetchInsights = async (lat, lon) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/insights?lat=${lat}&lon=${lon}`);
            const data = await res.json();
            setInsights(data);
        } catch (error) {
            console.error("Failed to fetch insights", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
                    fetchInsights(position.coords.latitude, position.coords.longitude);
                },
                (error) => console.warn(error)
            );
        }
    }, []);

    const handleRefresh = () => {
        if (location) fetchInsights(location.lat, location.lon);
    };

    if (!location) {
        return (
            <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 text-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                    <BrainCircuit className="text-purple-400" size={20} /> AI Insights
                </h2>
                <div className="text-center text-slate-500 mt-10 text-sm">
                    Allow Location Access to generate Live AI Summaries.
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 text-slate-200">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" size={20} />
                    Live AI Insights
                </h2>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 size={16} className="animate-spin text-purple-400" /> : "↻"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Weather Insight */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm shadow-sm">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        <CloudLightning size={14} className="text-blue-400" /> Weather Condition
                    </div>
                    <div className="text-slate-300 leading-relaxed min-h-[40px]">
                        {loading ? <div className="animate-pulse bg-slate-700/50 h-8 rounded w-full"></div> : insights?.weatherSummary || 'Data unavailable'}
                    </div>
                </div>

                {/* Scheduled Flights */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm shadow-sm">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        <Plane size={14} className="text-emerald-400" /> Regional Schedule
                    </div>
                    <div className="text-slate-300 leading-relaxed min-h-[40px]">
                        {loading ? <div className="animate-pulse bg-slate-700/50 h-8 rounded w-full"></div> : insights?.aviationSummary || 'Data unavailable'}
                    </div>
                </div>

                {/* Generative AI Summary */}
                <div className="bg-purple-900/10 border border-purple-800/30 rounded-lg p-3 text-sm shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl rounded-tr-none pointer-events-none"></div>
                    <div className="text-xs font-bold text-purple-300 mb-2 uppercase tracking-wide flex items-center gap-1.5 relative z-10">
                        <BrainCircuit size={14} className="text-purple-400 animate-pulse" /> Gemini AI Advisory
                    </div>
                    <div className="text-slate-200 leading-relaxed italic relative z-10 min-h-[80px]">
                        {loading ? (
                            <div className="space-y-2">
                                <div className="animate-pulse bg-purple-900/40 h-3 rounded w-full"></div>
                                <div className="animate-pulse bg-purple-900/40 h-3 rounded w-5/6"></div>
                                <div className="animate-pulse bg-purple-900/40 h-3 rounded w-4/6"></div>
                            </div>
                        ) : insights?.aiAnalysis || 'Advisory unavailable'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiInsightsPanel;
