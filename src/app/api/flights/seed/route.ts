import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flight from '@/models/Flight';

export async function POST(req: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');
    const countStr = searchParams.get('count');

    const lat = parseFloat(latStr || '0');
    const lon = parseFloat(lonStr || '0');
    const count = parseInt(countStr || '15');

    try {
        await Flight.deleteMany({}); // Clear old flights
        const newFlights = [];
        for (let i = 0; i < count; i++) {
            newFlights.push({
                callsign: `FLIGHT-${Math.floor(Math.random() * 9000) + 1000}`,
                lat: lat + (Math.random() * 2 - 1),
                lon: lon + (Math.random() * 2 - 1),
                altitude: Math.floor(Math.random() * 30000) + 10000,
                heading: Math.floor(Math.random() * 360),
                speed: Math.floor(Math.random() * 400) + 200,
                flightModel: 'B738'
            });
        }
        await Flight.insertMany(newFlights);

        return NextResponse.json({ message: 'Seeded successfully', count: newFlights.length });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to seed flights' }, { status: 500 });
    }
}
