// frontend/src/components/Map/KelaniBasinMap.jsx
import React, { useState } from 'react';

const KelaniBasinMap = ({ onRegionHover }) => {
    const [hoveredRegion, setHoveredRegion] = useState(null);

    // Key locations on the map with approximate coordinates (percentage based)
    const locations = [
        { id: 'kelani-ganga', name: 'Kelani Ganga', x: 50, y: 30, type: 'river' },
        { id: 'holombuwa', name: 'Holombuwa', x: 25, y: 45, type: 'station' },
        { id: 'kitulgala', name: 'Kitulgala', x: 40, y: 55, type: 'station' },
        { id: 'deraniyagala', name: 'Deraniyagala', x: 20, y: 70, type: 'station' },
        { id: 'norwood', name: 'Norwood', x: 55, y: 75, type: 'station' },
        { id: 'glencourse', name: 'Glencourse', x: 45, y: 85, type: 'station' },
        { id: 'hanwella', name: 'Hanwella', x: 70, y: 88, type: 'station' },
        { id: 'nagalagan', name: 'Nagalagan', x: 80, y: 92, type: 'station' },
    ];

    // Flood risk zones
    const zones = [
        { id: 'upper-basin', name: 'Upper Basin', x: 25, y: 35, width: 35, height: 25, risk: 'Low' },
        { id: 'middle-basin', name: 'Middle Basin', x: 25, y: 60, width: 40, height: 25, risk: 'Medium' },
        { id: 'lower-basin', name: 'Lower Basin', x: 55, y: 80, width: 35, height: 20, risk: 'High' },
    ];

    const handleMouseEnter = (regionId) => {
        setHoveredRegion(regionId);
        if (onRegionHover) {
            onRegionHover(regionId);
        }
    };

    const handleMouseLeave = () => {
        setHoveredRegion(null);
        if (onRegionHover) {
            onRegionHover(null);
        }
    };

    const getZoneBgColor = (risk) => {
        const colors = {
            Low: 'hover:bg-green-500/20',
            Medium: 'hover:bg-yellow-500/20',
            High: 'hover:bg-red-500/20',
        };
        return colors[risk] || 'hover:bg-blue-500/20';
    };

    const getZoneActiveColor = (risk) => {
        const colors = {
            Low: 'bg-green-500/40 stroke-green-600',
            Medium: 'bg-yellow-500/40 stroke-yellow-600',
            High: 'bg-red-500/40 stroke-red-600',
        };
        return colors[risk] || 'bg-blue-500/40 stroke-blue-600';
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-100">
                {/* Map Image - Place your image in public/images/ */}
                <img
                    src="/images/kelani-basin-map.jpeg"
                    alt="Kelani River Basin Map"
                    className="w-full h-auto"
                />

                {/* SVG Overlay */}
                <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {/* Zone Highlights */}
                    {zones.map((zone) => {
                        const isHovered = hoveredRegion === zone.id;
                        return (
                            <g key={zone.id}>
                                <rect
                                    x={zone.x}
                                    y={zone.y}
                                    width={zone.width}
                                    height={zone.height}
                                    rx={3}
                                    className={`transition-all duration-300 cursor-pointer ${
                                        isHovered
                                            ? getZoneActiveColor(zone.risk)
                                            : `fill-transparent ${getZoneBgColor(zone.risk)}`
                                    }`}
                                    stroke={isHovered ? '#dc2626' : 'transparent'}
                                    strokeWidth="2"
                                    onMouseEnter={() => handleMouseEnter(zone.id)}
                                    onMouseLeave={handleMouseLeave}
                                />
                                {/* Zone Label */}
                                <text
                                    x={zone.x + zone.width / 2}
                                    y={zone.y + zone.height / 2 + 1}
                                    fontSize="3.5"
                                    textAnchor="middle"
                                    className={`font-bold transition-all duration-300 ${
                                        isHovered ? 'fill-red-700' : 'fill-gray-600'
                                    }`}
                                    style={{ fontFamily: 'sans-serif' }}
                                    pointerEvents="none"
                                >
                                    {zone.name}
                                </text>
                            </g>
                        );
                    })}

                    {/* Location Markers */}
                    {locations.map((loc) => {
                        const isHovered = hoveredRegion === loc.id;
                        return (
                            <g
                                key={loc.id}
                                className="cursor-pointer"
                                onMouseEnter={() => handleMouseEnter(loc.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* Marker Circle */}
                                <circle
                                    cx={loc.x}
                                    cy={loc.y}
                                    r={2.5}
                                    className={`transition-all duration-300 ${
                                        isHovered
                                            ? 'fill-red-600 stroke-red-800 stroke-1'
                                            : 'fill-blue-600 hover:fill-red-500'
                                    }`}
                                />
                                {/* Pulse ring when hovered */}
                                {isHovered && (
                                    <circle
                                        cx={loc.x}
                                        cy={loc.y}
                                        r={5}
                                        className="fill-red-500/30 animate-ping"
                                    />
                                )}
                                {/* Label */}
                                <text
                                    x={loc.x + 4}
                                    y={loc.y + 1}
                                    fontSize="3"
                                    className={`text-[3px] font-medium transition-all duration-300 ${
                                        isHovered
                                            ? 'fill-red-700 font-bold'
                                            : 'fill-gray-700 hover:fill-red-600'
                                    }`}
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    {loc.name}
                                </text>
                            </g>
                        );
                    })}

                    {/* Scale Bar */}
                    <g className="absolute bottom-4 right-4">
                        <line
                            x1={70}
                            y1={92}
                            x2={85}
                            y2={92}
                            stroke="#333"
                            strokeWidth="0.5"
                        />
                        <text x={72} y={91} fontSize="2.5" fill="#555">
                            13 km
                        </text>
                    </g>
                </svg>
            </div>

            {/* Floating Info Panel */}
            {hoveredRegion && (
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 min-w-[200px] text-center animate-fadeIn border border-gray-200">
                    {(() => {
                        const zone = zones.find(z => z.id === hoveredRegion);
                        const location = locations.find(l => l.id === hoveredRegion);
                        if (zone) {
                            return (
                                <>
                                    <h4 className="font-bold text-blue-900">{zone.name}</h4>
                                    <p className="text-sm text-gray-600">Flood Risk Zone</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        zone.risk === 'Low' ? 'bg-green-100 text-green-700' :
                                        zone.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {zone.risk} Risk
                                    </span>
                                </>
                            );
                        }
                        if (location) {
                            return (
                                <>
                                    <h4 className="font-bold text-blue-900">{location.name}</h4>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {location.type === 'river' ? '🌊 River Location' : '📍 Monitoring Station'}
                                    </p>
                                </>
                            );
                        }
                        return <p className="text-sm text-gray-600">Loading...</p>;
                    })()}
                </div>
            )}
        </div>
    );
};

export default KelaniBasinMap;