import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flight from '@/models/Flight';

export async function GET() {
    await dbConnect();
    try {
        const flights = await Flight.find({});
        return NextResponse.json(flights);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch flights' }, { status: 500 });
    }
}
