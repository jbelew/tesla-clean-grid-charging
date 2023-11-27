import { NextResponse } from "next/server";
import { appSettings } from "../../utils/SettingsHelper";

export async function POST(request) {
    try {
        // Assuming 'request.body.json()' contains the payload sent in the request
        const requestBody = await request.json();

        // Validate the incoming data (add more validation if needed)
        if (!isValidData(requestBody)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }
        const data = {
            id: requestBody.id,
            vin: requestBody.vin,
            charge_management: requestBody.charge_management,
            home_latitude: requestBody.home_latitude,
            home_longitude: requestBody.home_longitude,
            battery_reserve: requestBody.battery_reserve,
            grid_threshold: requestBody.grid_threshold,
            last_seen: {
                battery_level: requestBody.last_seen.battery_level,
                estimated_range: requestBody.last_seen.estimated_range,
                charge_limit_soc: requestBody.last_seen.charge_limit_soc,
                latitude: requestBody.last_seen.latitude,
                longitude: requestBody.last_seen.longitude,
                timestamp: requestBody.last_seen.timestamp,
            },
        };

        // Attempt to create a record
        appSettings.create(data);

        return NextResponse.json({ status: 200, message: "Settings saved successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save settings. Please try again." }, { status: 500 });
    }
}

// Validate function for the incoming data
function isValidData(data) {
    return (
        data && typeof data.id === "number" && typeof data.vin === "string" && (data.battery_reserve === undefined || typeof data.battery_reserve === "number")
        // Add any additional validation for the vehicleState property
    );
}
