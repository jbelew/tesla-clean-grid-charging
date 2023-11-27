"use client";

/**
 * Fetches data from the wakeVehicle API endpoint for a specific vehicle.
 * @param {string} id - The ID of the vehicle to wake up.
 * @returns {Promise<Object>} A promise that resolves to the wakeVehicle response.
 * @throws {Error} If the network response is not OK.
 */
export async function wakeVehicle(id) {
    const response = await fetch(`/api/wakeVehicle/?id=${id}`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

/**
 * Wakes up a vehicle and waits until its state becomes "online".
 * @param {string} id - The ID of the vehicle to wake up.
 * @returns {Promise<Object>} A promise that resolves to the vehicle data when it is online.
 * @throws {Error} If there is an error during the wake process.
 */
export async function wakeVehicleUntilOnline(id) {
    const wakeVehicleInternal = async () => {
        try {
            const data = await wakeVehicle(id);
            // If the vehicle is online, resolve the promise
            if (data.state === "online") {
                return data;
            } else {
                // If the vehicle is not online, wait for 1000ms and call the function again
                await new Promise((resolve) => setTimeout(resolve, 1000));
                return wakeVehicleInternal();
            }
        } catch (error) {
            // Handle errors during the wake process
            console.error("Error during wake process:", error);
            throw error;
        }
    };
    return wakeVehicleInternal();
}
