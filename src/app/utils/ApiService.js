"use client";

import { Subject, timer, pipe } from "rxjs";
import { switchMap } from "rxjs/operators";
import { from, throwError, lastValueFrom, filter, finalize, mergeMap } from "rxjs";
import { catchError, take } from "rxjs/operators";
import { of } from "rxjs";

const vehiclesSubject = new Subject();
const vehicleDetailsSubject = new Subject();
const energyHistorySubject = new Subject();
const energyCurrentSubject = new Subject();

// Tesla API Calls
function fetchVehicles() {
    return from(
        fetch(`/api/getVehicles`).then(async (response) => {
            if (!response.ok) {
                throw new Error("API response from Tesla getVehicles was not ok");
            }
            const jsonData = await response.json();
            return jsonData;
        })
    ).pipe(
        catchError((error) => {
            // Handle the error for fetchVehicles
            console.error("Error in fetchVehicles:", error);
            return throwError(error); // Rethrow the error to propagate it to the subscriber
        })
    );
}

function fetchVehicleDetails() {
    return apiService.vehicles$.pipe(
        take(1),
        switchMap(async (vehiclesData) => {
            if (vehiclesData && vehiclesData.length > 0) {
                const { state, id } = vehiclesData[0];
                if (state === "online") {
                    try {
                        const response = await fetch(`/api/getVehicleData/?id=${id}`);
                        if (!response.ok) {
                            if (response.status === 429) {
                                throw { error: "Too Many Requests attempting to fetch vehicle details. Please try again later.", status: 429 };
                            } else {
                                throw { error: "Network response was not ok", status: response.status };
                            }
                        }
                        const jsonData = await response.json();
                        return jsonData;
                    } catch (error) {
                        console.error("Error fetching vehicle data:", error);
                        throw error;
                    }
                } else {
                    console.log("Vehicle is not online. fetchVehicleDetails call skipped.");
                    return null;
                }
            } else {
                console.log("No vehicles available. Cannot proceed.");
                return null;
            }
        }),
        catchError((error) => {
            console.error("Error in evaluating vehicles state while fetching vehicle details:", error);
            throw error;
        })
    );
}

// Electricity Maps API Calls
function fetchEnergyHistory() {
    // console.log("Fetching energy history ...");
    return from(
        fetch("https://api-access.electricitymaps.com/free-tier/power-breakdown/history?zone=US-CAL-CISO", {
            method: "GET",
            headers: {
                "auth-token": "xNqvHEPTmKI7JT8s3m25Y75JWcHYAli9",
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 429) {
                        // Return a specific object to indicate a 429 error
                        return { error: "Too Many Requests attempting to fetch energy history. Please try again later.", status: 429 };
                    } else {
                        // Return a specific object to indicate a network error
                        return { error: "Network response was not ok", status: response.status };
                    }
                }
                const jsonData = await response.json();
                return jsonData;
            })
            .catch((error) => {
                console.error("Error fetching energy history:", error);
                // Rethrow the error to propagate it to the subscriber
                throw error;
            })
    );
}

// Electricity Maps API Calls
function fetchEnergyCurrent() {
    // console.log("Fetching current energy breakdown ...");
    return from(
        fetch("https://api-access.electricitymaps.com/free-tier/power-breakdown/latest?zone=US-CAL-CISO", {
            method: "GET",
            headers: {
                "auth-token": "xNqvHEPTmKI7JT8s3m25Y75JWcHYAli9",
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 429) {
                        // Return a specific object to indicate a 429 error
                        return { error: "Too Many Requests attempting to fetch current energy breakdown. Please try again later.", status: 429 };
                    } else {
                        // Return a specific object to indicate a network error
                        return { error: "Network response was not ok", status: response.status };
                    }
                }
                const jsonData = await response.json();
                return jsonData;
            })
            .catch((error) => {
                console.error("Error fetching current energy breakdown:", error);
                // Rethrow the error to propagate it to the subscriber
                throw error;
            })
    );
}

const apiService = {
    fetchVehicles: () => fetchVehicles().subscribe((data) => vehiclesSubject.next(data)),
    fetchVehicleDetails: () => fetchVehicleDetails().subscribe((data) => vehicleDetailsSubject.next(data)),
    fetchEnergyHistory: () => fetchEnergyHistory().subscribe((data) => energyHistorySubject.next(data)),
    fetchEnergyCurrent: () => fetchEnergyCurrent().subscribe((data) => energyCurrentSubject.next(data)),

    triggerFetchVehicles: () => {
        console.log("Calling triggerFetchVehicles");
        fetchVehicles().subscribe((data) => {
            console.log("Vehicles Data received:", data);
            vehiclesSubject.next(data);
        });
    },
    triggerFetchVehicleDetails: async () => {
        console.log("Calling triggerFetchVehicleDetails");
        try {
            const data = await lastValueFrom(fetchVehicleDetails());
            console.log("Vehicle Details Data received:", data);
            vehicleDetailsSubject.next(data);
        } catch (error) {
            console.error("Error in triggerFetchVehicleDetails:", error);
        }
    },
    scheduleVehiclesRefresh: (intervalMs = 15 * 60 * 1000 /* 15 minutes */) => {
        timer(0, intervalMs)
            .pipe(switchMap(() => fetchVehicles()))
            .subscribe((data) => vehiclesSubject.next(data));
    },
    scheduleVehicleDetailsRefresh: (intervalMs = 15 * 60 * 1000 /* 15 minutes */) => {
        // console.log("Scheduling vehicle details refresh...");
        timer(0, intervalMs)
            .pipe(
                switchMap(() => fetchVehicleDetails()),
                filter((data) => data !== null) // Filter out null data
            )
            .subscribe((data) => vehicleDetailsSubject.next(data));
    },
    scheduleEnergyHistoryRefresh: (intervalMs = 15 * 60 * 1000 /* 15 minutes */) => {
        // console.log("Scheduling energy history refresh...");
        timer(0, intervalMs)
            .pipe(switchMap(() => fetchEnergyHistory()))
            .subscribe((data) => energyHistorySubject.next(data));
    },
    scheduleEnergyCurrentRefresh: (intervalMs = 15 * 60 * 1000 /* 15 minutes */) => {
        // console.log("Scheduling current energy breakdown refresh...");
        timer(0, intervalMs)
            .pipe(switchMap(() => fetchEnergyCurrent()))
            .subscribe((data) => energyCurrentSubject.next(data));
    },
    vehicles$: vehiclesSubject.asObservable(),
    vehicleDetails$: vehicleDetailsSubject.asObservable(),
    energyHistory$: energyHistorySubject.asObservable(),
    energyCurrent$: energyCurrentSubject.asObservable(),
};

const initializeApiService = () => {
    console.log("Initializing ApiService ...");
    apiService.scheduleVehiclesRefresh();
    apiService.scheduleVehicleDetailsRefresh();
    apiService.scheduleEnergyHistoryRefresh();
    apiService.scheduleEnergyCurrentRefresh();
};

export { initializeApiService, vehiclesSubject, vehicleDetailsSubject, energyHistorySubject, energyCurrentSubject, apiService };

export default apiService;
