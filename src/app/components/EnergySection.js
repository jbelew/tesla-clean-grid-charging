"use client";

import { useState, useEffect } from "react";
import { settingsSubject, updateSettings } from "../utils/SettingsService";
import { energyHistorySubject, energyCurrentSubject } from "../utils/ApiService";
// import apiService from "../utils/ApiService"; // Adjust the path as needed
import { Doughnut } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function parseHistory(jsonData) {
    const parsedData = jsonData;
    // Check if 'history' property exists
    if (parsedData.history && Array.isArray(parsedData.history)) {
        // Assuming datetime is in the format "2023-11-19T01:00:00.000Z"
        return parsedData.history.map((hourData) => ({
            fossilFree: hourData.fossilFreePercentage,
            renewablePercentage: hourData.renewablePercentage,
            hour: new Date(hourData.datetime).getUTCHours(),
            localHour: new Date(hourData.datetime).toLocaleTimeString([], { hour: "2-digit", hour12: false }),
        }));
    } else {
        // Return an empty array if 'history' is not present or not an array
        return [];
    }
}

function parseConsumption(data) {
    // Check if data or powerConsumptionBreakdown is missing
    if (!data || !data.powerConsumptionBreakdown) {
        // Handle invalid or missing data
        console.error("Invalid or missing power consumption data");
        return null;
    }
    const { powerConsumptionBreakdown } = data;
    // Filter out keys with a value of 0
    const filteredBreakdown = Object.fromEntries(Object.entries(powerConsumptionBreakdown).filter(([_, value]) => value !== 0));
    return filteredBreakdown;
}

const RenderElectricityMaps = () => {
    const [sliderValue, setSliderValue] = useState(50);
    const [sliderValueChanged, setSliderValueChanged] = useState(false);

    const [appSettings, setAppSettings] = useState(null);
    const [errorAppSettings, setErrorAppSettings] = useState();

    // Initial Energy History Chart object. This is updated in the subscription below.
    const [energyHistoryData, setEnergyHistoryData] = useState({
        labels: [],
        datasets: [
            {
                label: "Fossil Free Percentage",
                data: [],
                tension: 0.4,
                borderColor: "rgba(34, 197, 94, 1)",
                fill: { value: sliderValue, above: "rgba(34, 197, 94, 0.5)", below: "rgba(255, 0, 0, 0)" },
            },
            {
                label: "Renewable Percentage",
                data: [],
                tension: 0.4,
                borderColor: "rgba(59, 130, 246, 1)",
            },
        ],
    });
    const [errorEnergyHistory, setErrorEnergyHistory] = useState(null);

    // Initial Consumption Chart object. This is updated in the subscription below.
    const [currentConsumptionData, setCurrentConsumptionData] = useState({
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(153, 102, 255, 0.5)",
                    "rgba(255, 159, 64, 0.5)",
                ],
                hoverBackgroundColor: [
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(54, 162, 235, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(153, 102, 255, 0.8)",
                    "rgba(255, 159, 64, 0.8)",
                ],
            },
        ],
        options: {
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {},
            },
        },
    });
    const [errorCurrentConsumption, setErrorCurrentConsumption] = useState(null);

    const [fossilFreePercentage, setFossilFreePercentage] = useState(null);
    const [consumptionDataUpdated, setConsumptionDataUpdated] = useState(null);

    function handleSaveSettings() {
        let newSettings;
        newSettings = {
            ...appSettings,
            grid_threshold: Number(sliderValue),
        };
        updateSettings(newSettings);
    }

    function handleGraphUpdate(value) {
        setEnergyHistoryData((prevChartData) => ({
            ...prevChartData,
            datasets: [
                {
                    ...prevChartData.datasets[0],
                    fill: { value, above: "rgba(34, 197, 94, 0.5)", below: "rgba(255, 0, 0, 0)" },
                },
                {
                    ...prevChartData.datasets[1], // Retain the second dataset
                },
            ],
        }));
    }

    // Binding the form slider to the fill color of the chart
    const handleSliderChange = (event) => {
        const value = event.target.value;
        setSliderValue(value);
        setSliderValueChanged(true);
        handleGraphUpdate(value);
        setTimeout(() => {
            setSliderValueChanged(false);
        }, 1000); // 1000 milliseconds (1 second)
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

    // Energy History Subscription
    useEffect(() => {
        const historySubscription = energyHistorySubject.subscribe(
            async (data) => {
                try {
                    // console.log("Received energy history data in template:", data);

                    // Check if there's an error in the data
                    if (data.error) {
                        // Handle the error
                        console.error(`Error: ${data.error}`);
                        setErrorEnergyHistory(data.error);
                        return;
                    }

                    const historyAxis = await parseHistory(data);

                    setEnergyHistoryData((prevChartData) => ({
                        ...prevChartData,
                        labels: historyAxis.map((entry) => entry.localHour),
                        datasets: [
                            {
                                ...prevChartData.datasets[0],
                                data: historyAxis.map((entry) => entry.fossilFree),
                            },
                            {
                                ...prevChartData.datasets[1],
                                data: historyAxis.map((entry) => entry.renewablePercentage),
                            },
                        ],
                    }));
                } catch (error) {
                    // Handle parsing error
                    console.error("Error parsing data:", error);
                    setErrorEnergyHistory(error.message || "An error occurred");
                }
            },
            (error) => {
                // Handle subscription error
                console.error("Error fetching data:", error);
                setErrorEnergyHistory(error.message || "An error occurred");
            }
        );

        // Cleanup subscription on component unmount
        return () => {
            historySubscription.unsubscribe();
            setErrorEnergyHistory(null); // Reset error on component unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to run the effect only once on mount

    // Energy Consumption Subscription
    useEffect(() => {
        const consumptionSubscription = energyCurrentSubject.subscribe(
            async (data) => {
                try {
                    // console.log("Received energy consumption data in template:", data);

                    // Check if there's an error in the data
                    if (data.error) {
                        // Handle the error
                        console.error(`Error: ${data.error}`);
                        setErrorCurrentConsumption(data.error);
                        return;
                    }

                    // Extract specific properties
                    const { updatedAt, fossilFreePercentage, ...restData } = data;
                    // Use extracted properties as needed
                    setFossilFreePercentage(fossilFreePercentage);
                    setConsumptionDataUpdated(new Date().toLocaleTimeString());

                    const consumptionData = parseConsumption(data);
                    // const tooltipOptions = createTooltipOptions(consumptionData, currentConsumptionData);

                    setCurrentConsumptionData((prevData) => ({
                        ...prevData,
                        labels: Object.keys(consumptionData),
                        datasets: [
                            {
                                ...prevData.datasets[0],
                                data: Object.values(consumptionData),
                            },
                        ],
                        options: {
                            ...prevData.options,
                        },
                    }));
                } catch (error) {
                    // Handle parsing error
                    if (error.message === "Too Many Requests. Please try again later.") {
                        // Handle the 429 error more gracefully, perhaps by showing a user-friendly message
                        console.error("Too Many Requests. Please try again later.");
                    } else {
                        console.error("Error parsing data:", error);
                        setErrorCurrentConsumption(error.message || "An error occurred");
                    }
                }
            },
            (error) => {
                // Handle subscription error
                console.error("Error fetching data:", error);
                setErrorCurrentConsumption(error.message || "An error occurred");
            }
        );

        // Cleanup subscription on component unmount
        return () => {
            consumptionSubscription.unsubscribe();
            setErrorCurrentConsumption(null); // Reset error on component unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array to run the effect only once on mount

    // Update state variables when appSettings changes
    useEffect(() => {
        if (appSettings) {
            setSliderValue(appSettings.grid_threshold || 50);
            handleGraphUpdate(appSettings.grid_threshold);
        }
    }, [appSettings]);

    // Update settings when inputs change.
    useEffect(() => {
        if (appSettings && typeof appSettings === "object") {
            // Trigger saveSettings when specific state variables change
            handleSaveSettings();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sliderValueChanged]);

    return (
        appSettings && (
            <>
                <section className="p-4 mt-4 subpixel-antialiased border rounded-md shadow-lg">
                    <h2 className="mb-4">
                        Grid Status:{" "}
                        <span className="font-light">
                            {fossilFreePercentage > appSettings.grid_threshold ? "Exceeds Threshold!" : "Below Preferred Threshold"}
                        </span>
                    </h2>
                    <hr />
                    <div className="flex gap-4 mt-4 h-72">
                        <div className="flex-none w-48">
                            <div className="flex-grow mb-2 text-6xl font-extrabold text-center">{fossilFreePercentage}%</div>
                            {<Doughnut data={currentConsumptionData} options={currentConsumptionData.options} />}
                            <div className="flex-grow mt-4 text-sm font-semibold text-center">
                                Last updated: <span className="font-light">{consumptionDataUpdated}</span>
                            </div>
                        </div>
                        <div className="flex flex-col flex-grow ml-4">
                            <div className="flex-grow">
                                <Line className="absolute" data={energyHistoryData} options={{ maintainAspectRatio: false, responsive: true }} />
                            </div>
                            <div className="flex-none mt-4">
                                <label htmlFor="default-range" className="block mb-2">
                                    Fossil Free Energy Threshold: <span className="font-light">{sliderValue}%</span>
                                </label>
                                <input
                                    id="default-range"
                                    type="range"
                                    value={sliderValue}
                                    onChange={handleSliderChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    );
};

export default RenderElectricityMaps;
