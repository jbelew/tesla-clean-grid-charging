import { NextResponse } from "next/server";
import { appSettings } from "../../utils/SettingsHelper";

export async function GET(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    try {
        // console.log("Fetching settings for ID:", id);
        const settingsData = await appSettings.getById(id);
        // console.log("Settings data fetched successfully:", settingsData);
        return NextResponse.json(settingsData, { status: 200 });
    } catch (error) {
        console.error("Error while fetching settings.", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
