// src/components/FeelingsWheel/Wheel.jsx

import React, { useState, useMemo } from 'react';
import { FEELINGS_WHEEL } from './constants';
import { getInitials } from './constants';

const Wheel = ({ onSelectFeeling, disabled = false, isRevealed = false, participants = {} }) => {
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

  // Calculate center point of a segment (for placing avatars)
  const getSegmentCenter = (startAngle, endAngle, innerRadius, outerRadius) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (innerRadius + outerRadius) / 2;
    const angleRad = (midAngle - 90) * (Math.PI / 180);
    return {
      x: centerX + midRadius * Math.cos(angleRad),
      y: centerY + midRadius * Math.sin(angleRad),
    };
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
    if (disabled || isRevealed) return;
    if (selectedPrimary === emotion) {
      setSelectedPrimary(null);
      setSelectedSecondary(null);
    } else {
      setSelectedPrimary(emotion);
      setSelectedSecondary(null);
    }
  };

  const handleSecondaryClick = (emotion) => {
    if (disabled || isRevealed) return;
    if (selectedSecondary === emotion) {
      setSelectedSecondary(null);
    } else {
      setSelectedSecondary(emotion);
    }
  };

  const handleTertiaryClick = (tertiary) => {
    if (disabled || isRevealed) return;
    onSelectFeeling(selectedPrimary, selectedSecondary, tertiary);
    setSelectedPrimary(null);
    setSelectedSecondary(null);
  };

  // Build segments and avatar positions
  const { segments, avatarPositions } = useMemo(() => {
    const result = [];
    const avatars = [];
    const primaryAngle = 360 / primaryEmotions.length;

    // Build a map of tertiary -> segment info for avatar placement
    const tertiarySegmentMap = {};

    primaryEmotions.forEach((primary, i) => {
      const startAngle = i * primaryAngle;
      const endAngle = (i + 1) * primaryAngle;
      const data = FEELINGS_WHEEL[primary];

      // Primary segment (inner ring) - always shown
      result.push({
        type: 'primary',
        emotion: primary,
        path: createPieSegment(startAngle, endAngle, 60, 120),
        color: data.color,
        startAngle,
        endAngle,
      });

      const secondaryEmotions = Object.keys(data.secondary);
      const secondaryAngle = (endAngle - startAngle) / secondaryEmotions.length;

      // In revealed mode OR when this primary is selected, show secondary
      const showSecondary = isRevealed || selectedPrimary === primary;

      if (showSecondary) {
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

          const tertiaryEmotions = data.secondary[secondary];
          const tertiaryAngle = (secEnd - secStart) / tertiaryEmotions.length;

          // In revealed mode OR when this secondary is selected, show tertiary
          const showTertiary = isRevealed || selectedSecondary === secondary;

          if (showTertiary) {
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

              // Store segment info for avatar placement
              tertiarySegmentMap[`${primary}-${secondary}-${tertiary}`] = {
                center: getSegmentCenter(terStart, terEnd, 185, 240),
                color: data.color,
              };
            });
          }
        });
      }
    });

    // Calculate avatar positions for revealed mode
    if (isRevealed) {
      Object.entries(participants).forEach(([id, participant]) => {
        if (participant.feeling) {
          const key = `${participant.feeling.primary}-${participant.feeling.secondary}-${participant.feeling.tertiary}`;
          const segmentInfo = tertiarySegmentMap[key];
          if (segmentInfo) {
            avatars.push({
              id,
              participant,
              position: segmentInfo.center,
              color: segmentInfo.color,
            });
          }
        }
      });
    }

    return { segments: result, avatarPositions: avatars };
  }, [selectedPrimary, selectedSecondary, isRevealed, participants, primaryEmotions]);

  // Group avatars by position to handle multiple users selecting same feeling
  const groupedAvatars = useMemo(() => {
    const groups = {};
    avatarPositions.forEach((avatar) => {
      const key = `${Math.round(avatar.position.x)}-${Math.round(avatar.position.y)}`;
      if (!groups[key]) {
        groups[key] = { ...avatar, avatars: [avatar] };
      } else {
        groups[key].avatars.push(avatar);
      }
    });
    return Object.values(groups);
  }, [avatarPositions]);

  return (
    <div className="relative">
      <svg viewBox="0 0 500 500" className="w-full max-w-lg mx-auto">
        {segments.map((segment, i) => (
          <path
            key={`${segment.type}-${segment.emotion}-${i}`}
            d={segment.path}
            fill={segment.color}
            stroke="rgba(10, 10, 11, 0.5)"
            strokeWidth="2"
            className={`transition-all duration-200 ${
              disabled || isRevealed ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
            } ${hoveredSegment === `${segment.type}-${segment.emotion}` ? 'opacity-80' : ''}`}
            onMouseEnter={() => !isRevealed && setHoveredSegment(`${segment.type}-${segment.emotion}`)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => {
              if (segment.type === 'primary') handlePrimaryClick(segment.emotion);
              else if (segment.type === 'secondary') handleSecondaryClick(segment.emotion);
              else if (segment.type === 'tertiary') handleTertiaryClick(segment.emotion);
            }}
          />
        ))}

        {/* Render avatars when revealed */}
        {isRevealed && groupedAvatars.map((group, idx) => (
          <g key={idx}>
            {group.avatars.map((avatar, avatarIdx) => {
              const offsetX = avatarIdx * 6 - (group.avatars.length - 1) * 3;
              const offsetY = avatarIdx * 6 - (group.avatars.length - 1) * 3;
              const x = avatar.position.x + offsetX;
              const y = avatar.position.y + offsetY;
              const p = avatar.participant;

              return (
                <g key={avatar.id}>
                  {/* Avatar circle background */}
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill={p.avatarColor}
                    stroke="rgba(10, 10, 11, 0.8)"
                    strokeWidth="2"
                    className="drop-shadow-md"
                  />
                  {/* Avatar content */}
                  {p.avatarStyle === 'initials' ? (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {getInitials(p.name)}
                    </text>
                  ) : (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="14"
                    >
                      {p.avatarStyle === 'cat' ? '🐱' :
                       p.avatarStyle === 'dog' ? '🐕' :
                       p.avatarStyle === 'rabbit' ? '🐰' :
                       p.avatarStyle === 'fish' ? '🐟' :
                       p.avatarStyle === 'bird' ? '🐦' :
                       p.avatarStyle === 'mouse' ? '🐭' :
                       p.avatarStyle === 'bug' ? '🐛' :
                       p.avatarStyle === 'octocat' ? '🐙' : '😊'}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}

        {/* Center circle with label */}
        <circle
          cx={centerX}
          cy={centerY}
          r="55"
          fill="rgba(10, 10, 11, 0.9)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium pointer-events-none"
          fill="rgba(255, 255, 255, 0.7)"
        >
          {isRevealed ? 'Team Feelings' : (hoveredSegment ? hoveredSegment.split('-')[1] : 'How are you feeling?')}
        </text>
      </svg>

      {/* Breadcrumb - only show when not revealed */}
      {!isRevealed && (selectedPrimary || selectedSecondary) && (
        <div className="text-center mt-4 text-sm text-[var(--color-text-secondary)]">
          {selectedPrimary && <span className="font-medium text-[var(--color-text-primary)]">{selectedPrimary}</span>}
          {selectedSecondary && <span> → <span className="font-medium text-[var(--color-text-primary)]">{selectedSecondary}</span></span>}
          {selectedSecondary && <span className="text-[var(--color-text-muted)]"> → Select tertiary</span>}
          {selectedPrimary && !selectedSecondary && <span className="text-[var(--color-text-muted)]"> → Select secondary</span>}
        </div>
      )}
    </div>
  );
};

export default Wheel;
