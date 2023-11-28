import { NextResponse } from "next/server";
import { TokenHelper } from "../../utils/TokenHelper";

/**
 * Retrieves vehicle data from the Tesla API.
 * @returns {Promise<Response>} - The response containing the vehicle data.
 */
export async function GET(request) {
    try {
        // Extract the query parameters from the request
        const lat = new URL(request.url).searchParams.get('lat');
        const lon = new URL(request.url).searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json({ error: 'Missing required lat, long parameters!' }, { status: 400 });
        }
    
        // Retrieve the token data from the file
        const tokenData = TokenHelper.getByType("em_token");

        // Check if the token data is available
        if (!tokenData || !tokenData.token) {
            // Return a response indicating that the token is not found
            return NextResponse.json({ error: "Token not found" }, { status: 500 });
        }

        try {
            const response = await fetch(`https://api-access.electricitymaps.com/free-tier/power-breakdown/latest?lat=${lat}&lon=${lon}`, {
                method: "GET",
                headers: {
                    "auth-token": tokenData.token,
                },
            });
            
            if (!response.ok) {
                if (response.status === 429) {
                    // Return a specific object to indicate a 429 error
                    return NextResponse.json({ error: "Too Many Requests attempting to fetch current energy breakdown. Please try again later." }, { status: 429 });
                } else {
                    // Return a specific object to indicate a network error
                    return NextResponse.json({ error: "Network response was not ok", status: response.status });
                }
            }

            const jsonData = await response.json();
            // Return the response here
            return NextResponse.json(jsonData, { status: 200 });
        } catch (error) {
            console.error("Error fetching current energy breakdown:", error);
            // Return an error response
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    } catch (error) {
        // Handle errors related to reading the token file
        console.error("Error reading token file:", error);
        return NextResponse.json({ error: "Failed to read token file" }, { status: 500 });
    }
}
