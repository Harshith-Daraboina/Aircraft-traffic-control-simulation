"use client";
import React from 'react';
import { AlertCircle, Plane } from 'lucide-react';

const ConflictAlerts = ({ alerts }) => {
    return (
        <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 text-slate-200">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={20} />
                    Conflict Alerts
                </h2>
                <span className="bg-slate-800 px-2.5 py-0.5 flex items-center justify-center rounded-full text-xs font-mono font-bold">
                    {alerts.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alerts.length === 0 ? (
                    <div className="text-center text-slate-600 mt-10">
                        <Plane className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No conflicts detected</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div
                            key={`${alert.flight1}-${alert.flight2}-${idx}`}
                            className="bg-red-950/30 border border-red-900/50 rounded shadow-sm p-3 text-sm animate-[pulse_2s_ease-in-out_infinite]"
                        >
                            <div className="flex justify-between font-bold text-red-400 mb-2">
                                <span>{alert.flight1}</span>
                                <span className="text-red-600">⚡</span>
                                <span>{alert.flight2}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                                <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex flex-col items-center">
                                    <span className="text-slate-500 text-[10px] uppercase font-semibold mb-0.5">Separation</span>
                                    <span className="font-mono text-red-300">{alert.distanceKm.toFixed(2)} km</span>
                                </div>
                                <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex flex-col items-center">
                                    <span className="text-slate-500 text-[10px] uppercase font-semibold mb-0.5">Alt Diff</span>
                                    <span className="font-mono text-amber-300">{alert.altitudeDiffFt.toFixed(0)} ft</span>
                                </div>
                            </div>
                            <div className="text-center text-[10px] text-slate-500 mt-2 font-mono border-t border-red-900/30 pt-1">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ConflictAlerts;
