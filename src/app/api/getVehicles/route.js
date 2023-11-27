import { NextResponse } from "next/server";
import { TeslaApi } from "../../utils/TeslaApi";
import { TokenHelper } from "../../utils/TokenHelper";

/**
 * Retrieves vehicle data from the Tesla API.
 * @param {Request} request - The request object.
 * @returns {Promise<Response>} - The response containing the vehicle data.
 */
export async function GET() {
    try {
        // Retrieve the token data from the file
        const tokenData = TokenHelper.getByType("tesla_token");

        // Check if the token data is available
        if (!tokenData || !tokenData.token) {
            // Return a response indicating that the token is not found
            return NextResponse.json({ error: "Token not found" }, { status: 500 });
        }

        // Create an instance of TeslaApi with the retrieved token
        const api = new TeslaApi(null, null, tokenData.token);

        try {
            // Use the TeslaApi to get vehicle data with a timeout
            const vehicleData = await Promise.race([
                api.getVehicles(),
                timeout(5000), // Adjust the timeout value (in milliseconds) as needed
            ]);

            // Check if the result is from the API call or a timeout
            if (vehicleData === undefined) {
                throw new Error("Request timed out");
            }

            // Return the vehicle data in the response
            return NextResponse.json(vehicleData, { status: 200 });
        } catch (apiError) {
            // If an error occurs with the Tesla API, log the details and return an error response
            console.error("Error in Tesla API request:", apiError);
            return NextResponse.json({ error: "Failed to get vehicle data from Tesla API" }, { status: 500 });
        }
    } catch (fileError) {
        // Handle errors related to reading the token file
        console.error("Error reading token file:", fileError);
        return NextResponse.json({ error: "Failed to read token file" }, { status: 500 });
    }
}

// Define the timeout function
const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
