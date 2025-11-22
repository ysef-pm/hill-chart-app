// src/components/FeelingsWheel/Wheel.jsx

import React, { useState, useMemo } from 'react';
import { FEELINGS_WHEEL } from './constants';

const Wheel = ({ onSelectFeeling, disabled = false }) => {
  const [selectedPrimary, setSelectedPrimary] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const primaryEmotions = Object.keys(FEELINGS_WHEEL);
  const centerX = 250;
  const centerY = 250;

  // Calculate path for a pie segment
  const createPieSegment = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  // Lighten color for secondary/tertiary
  const lightenColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handlePrimaryClick = (emotion) => {
    if (disabled) return;
    if (selectedPrimary === emotion) {
      setSelectedPrimary(null);
      setSelectedSecondary(null);
    } else {
      setSelectedPrimary(emotion);
      setSelectedSecondary(null);
    }
  };

  const handleSecondaryClick = (emotion) => {
    if (disabled) return;
    if (selectedSecondary === emotion) {
      setSelectedSecondary(null);
    } else {
      setSelectedSecondary(emotion);
    }
  };

  const handleTertiaryClick = (tertiary) => {
    if (disabled) return;
    onSelectFeeling(selectedPrimary, selectedSecondary, tertiary);
    setSelectedPrimary(null);
    setSelectedSecondary(null);
  };

  // Build segments
  const segments = useMemo(() => {
    const result = [];
    const primaryAngle = 360 / primaryEmotions.length;

    primaryEmotions.forEach((primary, i) => {
      const startAngle = i * primaryAngle;
      const endAngle = (i + 1) * primaryAngle;
      const data = FEELINGS_WHEEL[primary];

      // Primary segment (inner ring)
      result.push({
        type: 'primary',
        emotion: primary,
        path: createPieSegment(startAngle, endAngle, 60, 120),
        color: data.color,
        startAngle,
        endAngle,
      });

      // Secondary segments (middle ring) - only if this primary is selected
      if (selectedPrimary === primary) {
        const secondaryEmotions = Object.keys(data.secondary);
        const secondaryAngle = (endAngle - startAngle) / secondaryEmotions.length;

        secondaryEmotions.forEach((secondary, j) => {
          const secStart = startAngle + j * secondaryAngle;
          const secEnd = startAngle + (j + 1) * secondaryAngle;

          result.push({
            type: 'secondary',
            emotion: secondary,
            primary,
            path: createPieSegment(secStart, secEnd, 125, 180),
            color: lightenColor(data.color, 30),
            startAngle: secStart,
            endAngle: secEnd,
          });

          // Tertiary segments (outer ring) - only if this secondary is selected
          if (selectedSecondary === secondary) {
            const tertiaryEmotions = data.secondary[secondary];
            const tertiaryAngle = (secEnd - secStart) / tertiaryEmotions.length;

            tertiaryEmotions.forEach((tertiary, k) => {
              const terStart = secStart + k * tertiaryAngle;
              const terEnd = secStart + (k + 1) * tertiaryAngle;

              result.push({
                type: 'tertiary',
                emotion: tertiary,
                primary,
                secondary,
                path: createPieSegment(terStart, terEnd, 185, 240),
                color: lightenColor(data.color, 60),
                startAngle: terStart,
                endAngle: terEnd,
              });
            });
          }
        });
      }
    });

    return result;
  }, [selectedPrimary, selectedSecondary]);

  return (
    <div className="relative">
      <svg viewBox="0 0 500 500" className="w-full max-w-lg mx-auto">
        {segments.map((segment, i) => (
          <path
            key={`${segment.type}-${segment.emotion}-${i}`}
            d={segment.path}
            fill={segment.color}
            stroke="white"
            strokeWidth="2"
            className={`transition-all duration-200 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
            } ${hoveredSegment === `${segment.type}-${segment.emotion}` ? 'opacity-80' : ''}`}
            onMouseEnter={() => setHoveredSegment(`${segment.type}-${segment.emotion}`)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => {
              if (segment.type === 'primary') handlePrimaryClick(segment.emotion);
              else if (segment.type === 'secondary') handleSecondaryClick(segment.emotion);
              else if (segment.type === 'tertiary') handleTertiaryClick(segment.emotion);
            }}
          />
        ))}

        {/* Center label */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-slate-600 pointer-events-none"
        >
          {hoveredSegment ? hoveredSegment.split('-')[1] : 'How are you feeling?'}
        </text>
      </svg>

      {/* Breadcrumb */}
      {(selectedPrimary || selectedSecondary) && (
        <div className="text-center mt-4 text-sm text-slate-600">
          {selectedPrimary && <span className="font-medium">{selectedPrimary}</span>}
          {selectedSecondary && <span> → <span className="font-medium">{selectedSecondary}</span></span>}
          {selectedSecondary && <span className="text-slate-400"> → Select tertiary</span>}
          {selectedPrimary && !selectedSecondary && <span className="text-slate-400"> → Select secondary</span>}
        </div>
      )}
    </div>
  );
};

export default Wheel;
