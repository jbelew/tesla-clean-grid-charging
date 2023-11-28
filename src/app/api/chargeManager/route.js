// pages/api/background-process.js

/* Overloading a Next.js route to run a background process. */

import cron from "node-cron";

async function fetchVehicles() {
    try {
        const response = await fetch(`/api/getVehicles`);

        if (!response.ok) {
            console.error("Error: Network response was not ok");
            throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error fetching settings data:", error);
        throw error;
    }
}

async function fetchSettings(id) {
    if (id) {
        try {
            const response = await fetch(`/api/getSettings?id=${id}`);

            if (!response.ok) {
                console.error("Error: Network response was not ok");
                throw new Error("Network response was not ok");
            }

            const jsonData = await response.json();
            return jsonData;
        } catch (error) {
            console.error("Error fetching settings data:", error);
            throw error;
        }
    } else {
        console.log("Vehicles data is empty or undefined");
        // You might want to return a default value or handle this case accordingly
        return null;
    }
}

// Your background process logic
const runBackgroundProcess = () => {
    console.log(fetchVehicles());
    console.log("Background process executed.");
    // Add your logic here
};

// Schedule the cron job
cron.schedule("* * * * *", runBackgroundProcess);

// Define the main handler function for GET requests
export async function GET(request) {
    const testMessage = "This is a test message for GET request.";
    console.log(testMessage);

    // You can still include other logic here if needed

    return new Response(testMessage, { status: 200, headers: { "Content-Type": "text/plain" } });
}
