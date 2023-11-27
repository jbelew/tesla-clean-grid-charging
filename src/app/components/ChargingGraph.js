// ChargingGraph.js
import React from "react";
import ChargingGraphBar from "./ChargingGraphBar";

const ChargingGraph = ({ sliderValue, batteryLevel, chargeLimitSoc }) => {
    const reserveWidth = `${sliderValue}%`;
    const currentWidth = `${batteryLevel - sliderValue}%`;
    const remainingWidth = `${chargeLimitSoc - batteryLevel}%`;

    return (
        <div className="flex h-10 mb-2 overflow-hidden rounded shadow-lg">
            <ChargingGraphBar width={reserveWidth} label="Reserve" color="bg-blue-500" fontWeight="font-semibold" />
            <ChargingGraphBar width={currentWidth} label={`${batteryLevel}%`} color="bg-green-400" fontWeight="font-semibold" />
            <ChargingGraphBar width={remainingWidth} label="" color="bg-green-600" fontWeight="font-light" />
            <ChargingGraphBar width={`${100 - chargeLimitSoc}%`} label="Trip" color="bg-slate-500" fontWeight="font-semibold" />
        </div>
    );
};

export default ChargingGraph;
