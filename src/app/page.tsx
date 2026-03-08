"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ConflictAlerts from '@/components/ConflictAlerts';
import AiInsightsPanel from '@/components/AiInsightsPanel';
import webSocketService from '@/services/websocket';
import { Activity } from 'lucide-react';

// Disable SSR for react-leaflet components
const RadarMap = dynamic(() => import('@/components/RadarMap'), { ssr: false });

export default function Home() {
  const [flights, setFlights] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch of flights from REST API
    fetch('/api/flights')
      .then(res => res.json())
      .then(data => {
        setFlights(data);
      })
      .catch(err => console.error("Failed to fetch initial flights", err));

    // Connect to STOMP WebSocket
    try {
      webSocketService.connect(
        (updatedFlights: any[]) => {
          setFlights(updatedFlights);
          setIsConnected(true);
        },
        (newAlerts: any[]) => {
          setAlerts(newAlerts);
        }
      );
    } catch (error) {
      console.error("WebSocket connection error", error);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return (
    <main className="flex w-full h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-green-500/30">
      {/* Main Radar Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Top bar overlay over map */}
        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl pointer-events-auto shadow-2xl min-w-[280px]">
            <h1 className="text-xl font-bold text-green-500 tracking-widest flex items-center gap-3 font-mono">
              <Activity strokeWidth={3} className={isConnected ? "animate-pulse" : ""} />
              ATC RADAR SYS
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-3 bg-slate-950/50 p-1.5 rounded border border-slate-800">
              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] border ${isConnected ? 'bg-green-500 border-green-400 text-green-500' : 'bg-red-500 border-red-400 text-red-500'}`}></div>
              <span className="font-mono tracking-wider">{isConnected ? 'LIVE FEED CONNECTED' : 'DISCONNECTED'}</span>
            </div>
            <div className="mt-3 flex justify-between items-end border-t border-slate-700/50 pt-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Targets</span>
              <span className="text-green-400 font-mono text-2xl font-bold leading-none">{flights.length}</span>
            </div>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(position => {
                    fetch(`/api/flights/seed?lat=${position.coords.latitude}&lon=${position.coords.longitude}&count=15`, { method: 'POST' });
                  });
                }
              }}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded py-2 text-xs font-mono font-bold tracking-widest text-slate-300 transition-colors pointer-events-auto"
            >
              SEED LOCAL FLIGHTS
            </button>
          </div>
        </div>

        {/* The Map */}
        <div className="flex-1 relative z-0">
          <RadarMap flights={flights as any} />
        </div>
      </div>

      {/* Sidebars Container */}
      <div className="flex flex-col w-80 h-full z-10 shrink-0 shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.8)]">
        <div className="flex-1 overflow-hidden h-1/2">
          <ConflictAlerts alerts={alerts} />
        </div>
        <div className="flex-1 overflow-hidden h-1/2">
          <AiInsightsPanel />
        </div>
      </div>
    </main>
  );
}
