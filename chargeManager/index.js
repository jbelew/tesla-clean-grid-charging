// Importing the GeofenceUtils module
const GeofenceUtils = require('./utils/GeofenceUtils');

// Importing node-fetch for making HTTP requests in Node.js using require
const fetch = require("node-fetch");

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Error: Network response was not ok for ${url}`);
        throw new Error(`Network response was not ok for ${url}`);
    }
    return response.json();
}

async function fetchVehicles() {
    return fetchJson("http://localhost:3000/api/getVehicles");
}

async function fetchVehicleDetails(id) {
    return fetchJson(`http://localhost:3000/api/getVehicleData?id=${id}`);
}

async function fetchSettings(id) {
    if (!id) {
        console.log("ID is empty or undefined");
        return null;
    }
    return fetchJson(`http://localhost:3000/api/getSettings?id=${id}`);
}

async function fetchEnergyCurrent(lat, lon) {
    if (!lat || !lon) {
        console.log("lat and or lon is empty or undefined");
        return null;
    }
    return fetchJson(`http://localhost:3000/api/getEnergyCurrent?lat=${lat}&lon=${lon}`);
}

// Your background process logic
const runBackgroundProcess = async () => {
    console.log("Background process started at:", new Date().toLocaleTimeString());
    
    try {
        const vehiclesData = await fetchVehicles();

        if (!vehiclesData || vehiclesData.length === 0) {
            console.log("No vehicle data available. Exiting...");
            return;
        }

        const vehicleId = vehiclesData[0].id;
        const vehicleOnline = vehiclesData[0].state === "online";

        if (!vehicleOnline) {
            console.log("Vehicle is not online. Exiting...");
            return;
        }

        console.log("Vehicle is online. Fetching settings ...");
        const appSettings = await fetchSettings(vehicleId);

        if (!appSettings) {
            console.log("No app settings available. Exiting...");
            return;
        }

        if (!appSettings.charge_management) {
            console.log("Charge management is disabled. Skipping ...");
            return;
        }

        console.log("Charge management is enabled. Continuing ...");

        // Assuming fetchVehicleDetails returns a Promise, you should await it
        const vehicleDetails = await fetchVehicleDetails(vehicleId);

        if (vehicleDetails.charge_state.charging_state !== "Charging") {
            console.log("Vehicle is not currently charging. Skipping charge management ...");
            return;
        }

        if (vehicleDetails.charge_state.battery_level < appSettings.battery_reserve) {
            console.log("Battery level is below reserve threshold. Continuing charge ...");
            return;
        }

        console.log("Battery level is above or equal to the threshold ...");

        if (GeofenceUtils.isWithinOneMile(
            appSettings.last_seen.latitude,
            appSettings.last_seen.longitude,
            appSettings.home_latitude,
            appSettings.home_longitude
        )) {
            console.log("Vehicle is at home ... ");
            const energyCurrent = await fetchEnergyCurrent(appSettings.home_latitude,appSettings.home_longitude);
            if (energyCurrent.fossilFreePercentage > appSettings.grid_threshold) {
                console.log("Fossil free percentage is above threshold. Continuing charge ...");
                    
                return;
            }
        }

    } catch (error) {
        console.error("Error during background process:", error);
    }
};

// Temporarily disable the cron job for testing
// cron.schedule('* * * * *', runBackgroundProcess);
runBackgroundProcess();
