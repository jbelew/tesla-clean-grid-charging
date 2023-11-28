"use client";

import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";
import { switchMap } from "rxjs/operators";
import apiService from "../utils/ApiService";

const settingsSubject = new BehaviorSubject(null);

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

async function initializeSettingsService() {
    const settings = await apiService.vehicles$
        .pipe(
            take(1), // Take only the first emission to ensure the subscription is completed
            switchMap(async (vehiclesData) => {
                if (vehiclesData) {
                    // console.log("Vehicles data received:", vehiclesData);
                    return await fetchSettings(vehiclesData[0].id);
                } else {
                    console.log("Vehicles data is empty or undefined");
                    return null;
                }
            })
        )
        .toPromise();
    settingsSubject.next(settings);
    return true;
}

function updateSettings(newSettings) {
    console.log("Updating settings:", newSettings);
    settingsSubject.next(newSettings);
    saveSettings(newSettings);
}

async function saveSettings(settings) {
    try {
        const response = await fetch("/api/saveSettings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            console.error("Network response was not ok");
        } else {
            console.log("Settings saved successfully");
        }
    } catch (error) {
        console.error("Error while saving settings:", error);
    }
}

// Expose the methods to other components
export { initializeSettingsService, settingsSubject, updateSettings, saveSettings };
