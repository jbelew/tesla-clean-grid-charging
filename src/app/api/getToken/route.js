import { NextResponse } from "next/server";
import { TokenHelper } from '../../utils/TokenHelper';

export async function GET(request) {
    try {
        const tokenData = TokenHelper.get();
        const tokenType = new URL(request.url).searchParams.get('tokenType');

        if (tokenType === 'tesla_token' || tokenType === 'em_token') {
            return handleTokenCheck(tokenData, tokenType);
        } else {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error while fetching the token:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}

function handleTokenCheck(tokenData, tokenType) {
    try {
        if (tokenData[tokenType]) {
            const response = {
                [tokenType]: true
            };
            return NextResponse.json(response, { status: 200 });
        } else {
            return NextResponse.json({ error: `${tokenType} not found` }, { status: 404 });
        }
    } catch (error) {
        console.error('Error while handling token check:', error);
        return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
    }
}
