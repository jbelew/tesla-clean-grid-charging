"use client";

import SettingsComponent from "./components/old/SettingsComponent"; // Update this line

import { initializeApiService } from "./utils/ApiService";
import { initializeSettingsService } from "./utils/SettingsService";
import RenderVehicles from "./components/Sidebar";
import RenderDetails from "./components/BatterySection";
import RenderElectricityMaps from "./components/EnergySection";
import RenderTokenOverlay from "./components/TeslaTokenOverlay";

export default function Home() {

    initializeApiService();
    initializeSettingsService();

    return (
        <main id="tesla-cgc" className="flex flex-col h-full sm:flex-row dark">
            {/* First grid item */}
            <div className="w-full p-4 sm:h-full sm:pt-4 sm:pl-4 sm:dark:bg-gray-700 sm:w-1/3 parent">
                <RenderVehicles />
            </div>

            {/* Second grid item */}
            <div className="w-full p-4 sm:w-2/3">
                <RenderDetails />
                <p />
                <RenderElectricityMaps />
                <br />
            </div>

            {/* RenderTokenOverlay component */}
            {/* Uncomment the line below if needed */}
            {/* <RenderTokenOverlay /> */}
        </main>
    );
}
