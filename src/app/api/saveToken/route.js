import { NextResponse } from "next/server";
import { TokenHelper } from '../../utils/TokenHelper';

export async function POST(request) {
    try {
        const requestBody = await request.json();

        // Validate the incoming data
        if (!requestBody || (typeof requestBody.tesla_token !== 'string' && typeof requestBody.em_token !== 'string')) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        if (requestBody.tesla_token) {
            const tokenData = {
                tesla_token: requestBody.tesla_token,
            };

            // Attempt to save the Tesla token
            TokenHelper.createTeslaToken({ token: tokenData.tesla_token });

            return NextResponse.json({ status: 200, message: 'Tesla token saved successfully' });
        } else if (requestBody.em_token) {
            const tokenData = {
                em_token: requestBody.em_token,
            };

            // Attempt to save the EM token
            TokenHelper.createEmToken({ token: tokenData.em_token });

            return NextResponse.json({ status: 200, message: 'EM token saved successfully' });
        } else {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error saving token:', error);
        return NextResponse.json({ error: 'Failed to save token. Please try again.' }, { status: 500 });
    }
}
