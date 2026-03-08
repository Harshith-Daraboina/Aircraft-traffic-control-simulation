"use client";
import { io } from 'socket.io-client';

const WEBSOCKET_URL = 'http://localhost:8081';

class WebSocketService {
    constructor() {
        this.socket = null;
    }

    connect(onFlightsUpdate, onAlertsUpdate) {
        this.socket = io(WEBSOCKET_URL, {
            reconnectionDelay: 5000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Node.js WebSocket server:', this.socket.id);
        });

        this.socket.on('flights', (data) => {
            if (data) onFlightsUpdate(data);
        });

        this.socket.on('alerts', (data) => {
            if (data) onAlertsUpdate(data);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
