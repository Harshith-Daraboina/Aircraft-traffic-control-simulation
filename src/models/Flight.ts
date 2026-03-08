import mongoose, { Schema, Document } from 'mongoose';

export interface IFlight extends Document {
    callsign: string;
    lat: number;
    lon: number;
    altitude: number;
    heading: number;
    speed: number;
    flightModel: string;
}

const FlightSchema: Schema = new Schema({
    callsign: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    altitude: { type: Number, required: true },
    heading: { type: Number, required: true },
    speed: { type: Number, required: true },
    flightModel: { type: String, required: true },
});

export default mongoose.models.Flight || mongoose.model<IFlight>('Flight', FlightSchema);
