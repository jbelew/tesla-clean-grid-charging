"use client";

import { useState, useEffect, useRef } from "react";

// import apiService from "../utils/ApiService";
import { settingsSubject, updateSettings } from "../utils/SettingsService";
import { vehiclesSubject, vehicleDetailsSubject, triggerFetchVehicles, triggerFetchVehicleDetails, apiService } from "../utils/ApiService";

import { wakeVehicleUntilOnline } from "../utils/VehicleCommands.js";
import { isWithinOneMile } from "../utils/GeofenceUtils.js.js";
import MapsEmbed from "./MapsEmbed";

/**
 * Component to render a list of vehicles and provide wake functionality.
 */
function RenderVehicles() {
    // State hooks for vehicle data and loading state
    const [vehiclesData, setVehiclesData] = useState([]);
    const [errorVehicles, setErrorVehicles] = useState(null);
    const [vehicleDetails, setVehicleDetails] = useState([]);
    const [errorVehicleDetails, setErrorVehicleDetails] = useState([]);
    const [appSettings, setAppSettings] = useState(null);
    const [errorAppSettings, setErrorAppSettings] = useState({});
    const [wakingVehicle, setUpdatingVehicles] = useState(false);

    /**
     * Determines if a vehicle is at home based on the provided settings data.
     * @param {Array|Object} data - The settings data for the application(s).
     * @returns {Array} - An array of boolean values indicating whether each vehicle is at home.
     */
    function isVehicleHome(data) {
        let currentLatitude = 0;
        let currentLongitude = 0;

        if (vehiclesData.state === "online") {
            currentLatitude = vehicleDetails.drive_state.active_route_latitude;
            currentLongitude = vehicleDetails.drive_state.active_route_longitude;
        } else {
            currentLatitude = data.last_seen.latitude;
            currentLongitude = data.last_seen.longitude;
        }
        const homeLatitude = data.home_latitude;
        const homeLongitude = data.home_longitude;
        return isWithinOneMile(currentLatitude, currentLongitude, homeLatitude, homeLongitude);
    }

    /**
     * Handles waking up a vehicle and refreshes the data.
     * @param {string} id - The ID of the vehicle to wake up.
     */
    const handleWakeVehicle = async (id) => {
        const shouldProceed = window.confirm("Are you sure you want to proceed?");
        if (shouldProceed) {
            setUpdatingVehicles(true);
            try {
                await wakeVehicleUntilOnline(id);
            } catch (error) {
                console.error("Error handling the wake function:", error);
            } finally {
                // Trigger fetchVehicles
                apiService.triggerFetchVehicles();
                apiService.triggerFetchVehicleDetails();
                setUpdatingVehicles(false);
            }
        }
    };

    const handleResetHomeLocation = (event) => {
        event.preventDefault();
        const shouldProceed = window.confirm(
            "Are you sure you want to reset your home charger location? To ensure accurate operation, your vehicle should be parked at your home charger and preferably in a charging state."
        );
        if (shouldProceed) {
            const latitude = vehicleDetails.drive_state.active_route_latitude;
            const longitude = vehicleDetails.drive_state.active_route_longitude;
            handleSaveHomeSettings(latitude, longitude);
            isVehicleHome(appSettings);
        }
    };

    const handleSaveHomeSettings = async (lat, long) => {
        // Simulate updating settings from a form or other user interaction
        const newSettings = { ...appSettings, home_latitude: lat, home_longitude: long };
        updateSettings(newSettings);
    };

    // Subscribe to settingsSubject to get updates
    useEffect(() => {
        const settingsSubscription = settingsSubject.subscribe((newSettings) => {
            setAppSettings(newSettings);
        },
        (error) => {
            // Handle subscription error
            console.error("Error in settings subscription:", error);
            setErrorAppSettings(error.message || "An error occurred");
        }
        );
        // Cleanup the subscription when the component unmounts
        return () => {
            settingsSubscription.unsubscribe();
        };
    }, []);

    // Subscribe to vehiclesSubject to get updates
    useEffect(() => {
        const vehiclesSubscription = vehiclesSubject.subscribe((vehiclesData) => {
                setVehiclesData(vehiclesData);
            },
            (error) => {
                // Handle subscription error
                console.error("Error in vehicles subscription:", error);
                setErrorVehicles(error.message || "An error occurred");
            }
        );
        // Cleanup subscription on component unmount
        return () => {
            vehiclesSubscription.unsubscribe();
            setErrorVehicles(null); // Reset error on component unmount
        };
    }, []);

    // Subscribe to vehicleDetails to get updates
    useEffect(() => {
        const vehicleDetailsSubscription = vehicleDetailsSubject.subscribe((vehicleDetails) => {
                setVehicleDetails(vehicleDetails);
            },
            (error) => {
                // Handle subscription error
                console.error("Error in vehicles subscription:", error);
                setErrorVehicleDetails(error.message || "An error occurred");
            }
        );
        // Cleanup subscription on component unmount
        return () => {
            vehicleDetailsSubscription.unsubscribe();
            setErrorVehicleDetails(null); // Reset error on component unmount
        };
    }, []);

    // Render list of vehicles with wake functionality
    return (
        <div className="flex-1 subpixel-antialiased" id="sidebar">
            {vehiclesData.map((vehicle) => (
                <div key={vehicle.id} className="flex flex-col flex-1 h-full">
                    <h1 className="pb-2">Tesla Clean Grid Charging</h1>
                    <hr />
                    {appSettings && (
                        <>
                            <div className="flex w-full mt-4">
                                <div className="grow">
                                    <h2>{vehicle.display_name}</h2>
                                    <p className="mb-2 text-xs">Last Seen at {new Date(appSettings.last_seen?.timestamp).toLocaleTimeString()}</p>

                                    <>
                                        <p className="text-sm">
                                            <strong>Battery:</strong> {appSettings.last_seen.battery_level}%
                                        </p>
                                        <p className="text-sm">
                                            <strong>Location:</strong> {isVehicleHome(appSettings) ? "At Home" : "Roaming"}
                                        </p>
                                    </>
                                </div>
                                <div>
                                    <button
                                        className={`px-4 py-1 font-bold text-white capitalize bg-blue-500 rounded shadow-md ${
                                            vehicle.state === "online" || wakingVehicle ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                                        }`}
                                        onClick={() => vehicle.state !== "online" && !wakingVehicle && handleWakeVehicle(vehicle.id)}
                                        disabled={vehicle.state === "online" || wakingVehicle}>
                                        {vehicle.state === "online" ? "Online" : wakingVehicle ? "Waking..." : "Wake"}
                                    </button>
                                </div>
                            </div>

                            <div className="top">
                                {appSettings && (
                                    <>
                                        <h3 className="pt-4 pb-0 font-bold">Current Home Location:</h3>
                                        <MapsEmbed lat={appSettings.last_seen?.latitude} long={appSettings.last_seen?.longitude} />
                                        {vehicle.state === "online" && (
                                            <>
                                                <div className="mt-2 text-sm text-right grow">
                                                    <a href="#" onClick={handleResetHomeLocation}>
                                                        Reset Home Location?
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                                {!appSettings && <p className="text-sm">No data available</p>}
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default RenderVehicles;
