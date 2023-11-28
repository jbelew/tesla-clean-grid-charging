import { NextResponse } from "next/server";
import { TeslaApi } from '../../utils/TeslaApi';
import { TokenHelper } from '../../utils/TokenHelper';

/**
 * Retrieves vehicle data based on the provided ID.
 * @param {Request} request - The request object.
 * @returns {Promise<Response>} - The response containing the vehicle data.
 */

export async function GET(request) {
	// Retrieve the token data from the file
    const tokenData = TokenHelper.getByType('tesla_token');
	
	// Check if the token data is available
	if (!tokenData || !tokenData.token) {
		return NextResponse.json({ error: 'Token not found' }, { status: 500 });
	}

	// Create an instance of TeslaApi with the retrieved token
	const api = new TeslaApi(null, null, tokenData.token);

	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	const command = url.searchParams.get("command");

	// Check if the 'id' parameter is present
	if (!id) {
		return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
	}
	// Use the 'id' parameter in your API request
	try {
		console.log(id,command);
		const vehicleData = await api.command(command,id);
		return NextResponse.json(vehicleData, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Failed to get vehicle data' }, { status: 500 });
	}
}