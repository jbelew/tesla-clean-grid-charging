"use client";

import React, { useEffect, useState } from "react";

import { settingsSubject, updateSettings } from "../utils/SettingsService";
import { vehiclesSubject, vehicleDetailsSubject } from "../utils/ApiService";
import { isWithinOneMile } from "../utils/GeofenceUtils.js.js";

import ChargingGraph from "./ChargingGraph";
import "./Shimmer.css"; // External CSS file

const RenderDetails = () => {
    const [sliderValue, setSliderValue] = useState(50); // Provide a default value
    const [sliderValueChanged, setSliderValueChanged] = useState(false);
    const [isChargeManagementEnabled, setIsChargeManagementEnabled] = useState(false);

    const [appSettings, setAppSettings] = useState(null);
    const [errorAppSettings, setErrorAppSettings] = useState();
    const [appSettingsLoaded, setAppSettingsLoaded] = useState(false);
    const [vehiclesData, setVehiclesData] = useState(null);
    const [errorVehiclesData, setErrorVehiclesData] = useState();
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [errorVehicleDetails, setErrorVehicleDetails] = useState();

    // Event handler to update the checkbox state
    const handleChargeManagement = (event) => {
        setIsChargeManagementEnabled(event.target.checked);
    };

    const handleSliderChange = (event) => {
        const value = event.target.value;
        setSliderValue(value);
        setSliderValueChanged(true);
        // Reset the flag after a delay (adjust the delay duration as needed)
        setTimeout(() => {
            setSliderValueChanged(false);
        }, 1000); // 1000 milliseconds (1 second)
    };

    function translateReserveRange() {
        const maxRangeMiles = (appSettings.last_seen?.estimated_range / appSettings.last_seen?.battery_level) * appSettings.last_seen?.charge_limit_soc;
        const reserveRangeMiles = maxRangeMiles * (sliderValue / 100);
        return reserveRangeMiles;
    }

    function isVehicleIsHome() {
        const currentLatitude = vehicleDetails.drive_state?.active_route_latitude;
        const currentLongitude = vehicleDetails.drive_state?.active_route_longitude;
        const homeLatitude = appSettings.home_latitude; // 37.7749; // Replace with your target latitude
        const homeLongitude = appSettings.home_longitude; // -122.4194; // Replace with your target longitude
        return isWithinOneMile(currentLatitude, currentLongitude, homeLatitude, homeLongitude);
    }

    const handleSaveSettings = async () => {
        let newSettings;
        if (vehicleDetails && typeof vehicleDetails === "object" && Object.keys(vehicleDetails).length > 0) {
            newSettings = {
                ...appSettings,
                charge_management: isChargeManagementEnabled,
                battery_reserve: Number(sliderValue),
                last_seen: {
                    battery_level: vehicleDetails?.charge_state?.battery_level,
                    estimated_range: vehicleDetails?.charge_state?.battery_range,
                    charge_limit_soc: vehicleDetails?.charge_state?.charge_limit_soc,
                    latitude: vehicleDetails?.drive_state?.active_route_latitude,
                    longitude: vehicleDetails?.drive_state?.active_route_longitude,
                    timestamp: Date.now(),
                },
            };
        } else {
            newSettings = {
                ...appSettings,
                charge_management: isChargeManagementEnabled,
                battery_reserve: Number(sliderValue),
            };
        }
        updateSettings(newSettings);
    };

    // Subscribe to settingsSubject to get updates
    useEffect(() => {
        const settingsSubscription = settingsSubject.subscribe(
            (newSettings) => {
                setAppSettings(newSettings);
                // console.log("New settings received in Battery template:", newSettings);
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
        const vehiclesSubscription = vehiclesSubject.subscribe(
            (vehiclesData) => {
                // console.log("New vehiclesData received in Battery template:", vehiclesData);
                setVehiclesData(vehiclesData);
            },
            (error) => {
                // Handle subscription error
                console.error("Error in vehicles subscription:", error);
                setErrorVehiclesData(error.message || "An error occurred");
            }
        );
        // Cleanup subscription on component unmount
        return () => {
            vehiclesSubscription.unsubscribe();
            setErrorVehicleDetails(null); // Reset error on component unmount
        };
    }, []);

    // Subscribe to vehicleDetails to get updates
    useEffect(() => {
        const vehicleDetailsSubscription = vehicleDetailsSubject.subscribe(
            (vehicleDetails) => {
                // console.log("New vehicleDetails received in Battery template:", vehicleDetails);
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

    // Update state variables when appSettings changes
    useEffect(() => {
        if (appSettings) {
            setSliderValue(appSettings.battery_reserve || 50);
            setIsChargeManagementEnabled(appSettings.charge_management);
        }
    }, [appSettings]);

    // Update settings when inputs
    useEffect(() => {
        if (appSettings && typeof appSettings === "object") {
            // Trigger saveSettings when specific state variables change
            handleSaveSettings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChargeManagementEnabled, sliderValueChanged]);

    if (appSettings) {
        return appSettings && vehicleDetails && vehiclesData[0].state === "online" ? (
            <section className="p-4 subpixel-antialiased rounded-md shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex-grow content-top">
                        <h1 className="mt-0 text-xl font-bold">
                            Charge Management:{" "}
                            <span className="font-light">{isChargeManagementEnabled ? (isVehicleIsHome() ? "Enabled" : "Out of Home Area") : "Disabled"}</span>
                        </h1>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isChargeManagementEnabled} className="sr-only peer" onChange={handleChargeManagement} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
                    </label>
                </div>
                <hr className="mb-4" />
                <div className="mb-4">
                    <span className="inline-block px-2 py-1 mr-2 font-semibold rounded shadow-md bg-slate-200">
                        &nbsp;{vehicleDetails.charge_state?.charging_state}&nbsp;
                    </span>
                    <span className="inline-block font-semibold text-gray-900">
                        Current SoC: <span className="font-light">{vehicleDetails.charge_state?.battery_level}%</span>
                    </span>
                </div>
                <ChargingGraph
                    sliderValue={sliderValue}
                    batteryLevel={vehicleDetails.charge_state?.battery_level}
                    chargeLimitSoc={vehicleDetails.charge_state?.charge_limit_soc}
                />
                <div className="flex items-center justify-between mt-2">
                    <span />
                    <span className="inline-block text-sm font-semibold ">
                        Current Estimated Range: <span className="font-light">{Math.round(vehicleDetails?.charge_state?.battery_range)} miles</span>
                    </span>
                </div>

                {/* Range slider graph */}
                <div className="pt-4">
                    <label htmlFor="default-range" className="block mb-2 font-semibold">
                        Battery Reserve Value: <span className="font-light">{sliderValue}%</span>
                    </label>
                    <input
                        id="default-range"
                        type="range"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />

                    <div className="flex items-center justify-between mt-1 mb-2">
                        <span />
                        <span className="inline-block text-sm font-semibold ">
                            Estimated Reserve Range: <span className="font-light">{Math.round(translateReserveRange())} miles</span>
                        </span>
                    </div>
                </div>
            </section>
        ) : (
            <section className="p-4 subpixel-antialiased rounded-md shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex-grow content-top">
                        <h1 className="mt-0 text-xl font-bold">
                            Charge Management: <span className="font-light">Offline</span>
                        </h1>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isChargeManagementEnabled} className="sr-only peer" onChange={handleChargeManagement} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
                    </label>
                </div>
                <hr className="mb-4" />
                <div className="mb-4">
                    <span className="inline-block px-2 py-1 mr-2 font-semibold rounded shadow-md bg-slate-200">Offline</span>
                    <span className="inline-block font-semibold text-gray-900">
                        Current SoC: <span className="font-light">{appSettings.last_seen?.battery_level}%</span>
                    </span>
                </div>
                <ChargingGraph
                    sliderValue={sliderValue}
                    batteryLevel={appSettings.last_seen?.battery_level}
                    chargeLimitSoc={appSettings.last_seen?.charge_limit_soc}
                />
                <div className="flex items-center justify-between mt-2">
                    <span />
                    <span className="inline-block text-sm font-semibold ">
                        Current Estimated Range: <span className="font-light">{Math.round(appSettings.last_seen?.estimated_range)} miles</span>
                    </span>
                </div>

                <div className="pt-4">
                    <label htmlFor="default-range" className="block mb-2 font-semibold">
                        Battery Reserve Value: <span className="font-light">{sliderValue}%</span>
                    </label>
                    <input
                        id="default-range"
                        type="range"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />

                    <div className="flex items-center justify-between mt-1 mb-2">
                        <span />
                        <span className="inline-block text-sm font-semibold ">
                            Estimated Reserve Range: <span className="font-light">{Math.round(translateReserveRange())} miles</span>
                        </span>
                    </div>
                </div>
            </section>
        );
    } else {
        return <p>Loading ...</p>;
    }
};

export default RenderDetails;
