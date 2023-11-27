const ChargingGraphBar = ({ width, label, color, fontWeight }) => (
    <div style={{ width }} className={`flex flex-col justify-center text-center text-white ${color} shadow-none whitespace-nowrap`}>
        <span className={`text-sm ${fontWeight}`}>{label}</span>
    </div>
);

export default ChargingGraphBar;
