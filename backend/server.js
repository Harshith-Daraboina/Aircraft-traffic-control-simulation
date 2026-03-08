require('dotenv').config({ path: '../.env' }); // Load .env from parent directory
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS for Next.js frontend
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/atc_simulator';
mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB via Node.js');
    seedDatabase();
}).catch(err => console.error('MongoDB connection error:', err));

// Flight Schema
const FlightSchema = new mongoose.Schema({
    callsign: String,
    lat: Number,
    lon: Number,
    altitude: Number,
    heading: Number,
    speed: Number,
    flightModel: String,
    status: { type: String, default: 'Normal' }
});
const Flight = mongoose.model('Flight', FlightSchema);

// Seeding logic
async function seedDatabase() {
    try {
        const count = await Flight.countDocuments();
        if (count === 0) {
            console.log('Seeding initial flight data...');
            const initialFlights = [
                { callsign: 'AIC101', lat: 28.5562, lon: 77.1000, altitude: 35000, heading: 270, speed: 450, flightModel: 'B787' },
                { callsign: '6E5321', lat: 19.0896, lon: 72.8656, altitude: 32000, heading: 45, speed: 420, flightModel: 'A320' },
                { callsign: 'UK982', lat: 13.1986, lon: 77.7066, altitude: 28000, heading: 0, speed: 400, flightModel: 'A321' },
                { callsign: 'G8144', lat: 22.6429, lon: 88.4467, altitude: 34000, heading: 180, speed: 430, flightModel: 'A320' },
                { callsign: 'EMR202', lat: 25.0777, lon: 55.3075, altitude: 38000, heading: 90, speed: 480, flightModel: 'B777' }
            ];
            await Flight.insertMany(initialFlights);
            console.log('Database seeded successfully.');
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
}

// Distance calculation for conflict detection
function getDistance(f1, f2) {
    const dLat = f1.lat - f2.lat;
    const dLon = f1.lon - f2.lon;
    const dAlt = Math.abs(f1.altitude - f2.altitude);
    // Rough approximation for lat/lon distance in NM
    const distNM = Math.sqrt(dLat * dLat + dLon * dLon) * 60;
    return { distNM, dAlt };
}

// Simulation Interval (Update every 2 seconds)
setInterval(async () => {
    try {
        const flights = await Flight.find();
        if (flights.length === 0) return;

        const DT = 2 / 3600; // 2 seconds in hours

        // 1. Update positions
        for (let flight of flights) {
            const rad = (flight.heading * Math.PI) / 180;
            // dLat = (speed * cos(heading) * DT) / 60
            const dLat = (flight.speed * Math.cos(rad) * DT) / 60;
            // dLon = (speed * sin(heading) * DT) / (60 * cos(lat))
            const dLon = (flight.speed * Math.sin(rad) * DT) / (60 * Math.cos(flight.lat * Math.PI / 180));

            flight.lat += dLat;
            flight.lon += dLon;

            // Basic jitter/fluctuation
            flight.altitude += (Math.random() * 40 - 20);

            // Check for status reset
            flight.status = 'Normal';
        }

        // 2. Conflict Detection (Basic O(N^2) for simulation)
        for (let i = 0; i < flights.length; i++) {
            for (let j = i + 1; j < flights.length; j++) {
                const { distNM, dAlt } = getDistance(flights[i], flights[j]);
                // If within 5NM and 1000ft altitude difference
                if (distNM < 5 && dAlt < 1000) {
                    flights[i].status = 'Conflict';
                    flights[j].status = 'Conflict';
                }
            }
        }

        // 3. Save and Broadcast
        for (let flight of flights) {
            await flight.save();
        }
        io.to('radar').emit('flights', flights);

    } catch (err) {
        console.error("Simulation error:", err);
    }
}, 2000);

// WebSocket Connection Handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.join('radar');

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`🚀 ATC Backend running on port ${PORT}`);
});
