import React from "react";

const MapsEmbed = ({ lat = 37.710248, long = -122.436306 }) => {
    const mapsSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD5ciDgSNTNZ1Jki6mYtuwsdtBXW0SPkgQ&q=${lat},${long}&zoom=14`;

    return (
        <div>
            <iframe
                title="Google Maps"
                className="w-full mt-2 border rounded-md shadow-lg aspect-video border-slate-300"
                loading="lazy"
                src={mapsSrc}
                allowFullScreen></iframe>
        </div>
    );
};

export default MapsEmbed;
