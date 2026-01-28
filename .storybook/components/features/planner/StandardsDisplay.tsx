import React, { useState } from 'react';

interface StandardsDisplayProps {
  standards: string[];
  className?: string;
  limitedSpace?: boolean; // New prop for limited space scenarios
  showTop?: boolean;
}

export const StandardsDisplay: React.FC<StandardsDisplayProps> = ({ 
  standards = [], 
  className = "col-auto",
  limitedSpace = false, // Default to false for full functionality
  showTop = true
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  if (!standards || standards.length === 0) {
    return null;
  }

  // Show only the first standard
  const firstStandard = standards[0];
  const remainingCount = standards.length - 1;

  // If there's only one standard, show it with standard badge styling
  if (standards.length === 1) {
    return (
      <span className={`${className} standards-display-single`} style={{
        backgroundColor: '#e8d5f7', // light-pink-purple equivalent
        color: '#4a4a4a', // greystone-800 equivalent
        padding: '0.25rem 0.5rem',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '0.25rem',
        display: 'inline-block'
      }}>
        {firstStandard}
      </span>
    );
  }

  // If there are multiple standards, show grouped element with conditional tooltip and text
  const allStandardsText = standards.slice(1).join(', ');
  
  return (
    <div 
      className={`${className} standards-display-group`} 
      style={{ 
        position: 'relative',
        display: 'inline-block',
        maxWidth: limitedSpace ? '100%' : 'auto' // Ensure it respects container width
      }}
      onMouseEnter={() => !limitedSpace && setShowTooltipState(true)}
      onMouseLeave={() => !limitedSpace && setShowTooltipState(false)}
    >
      <div style={{ 
        backgroundColor: '#e8d5f7', // light-pink-purple equivalent
        color: '#4a4a4a', // greystone-800 equivalent
        padding: '0.25rem 0.5rem',
        fontSize: '14px',
        fontWeight: 500,
        borderRadius: '0.25rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        cursor: limitedSpace ? 'default' : 'pointer',
        maxWidth: limitedSpace ? '100%' : 'auto',
        overflow: limitedSpace ? 'hidden' : 'visible',
        textOverflow: limitedSpace ? 'ellipsis' : 'clip',
        whiteSpace: limitedSpace ? 'nowrap' : 'normal'
      }}>
        <span style={{
       ...(limitedSpace && {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '8rem'
          })
        }}>{firstStandard}</span>
        <span style={{ opacity: 0.8 }}>
          {limitedSpace ? `+${remainingCount}` : `+${remainingCount} more`}
        </span>
      </div>
      
      {!limitedSpace && showTooltipState && (
        <div 
          style={{
            position: 'absolute',
            bottom: showTop ? '100%' : 'auto',
            top: showTop ? 'auto' : '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            color: 'black',
            border: '0.0938rem solid black', // 1.5px converted to rem
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 400,
            textAlign: 'left',
            letterSpacing: '0.0125rem',
            lineHeight: '1.3rem',
            textTransform: 'none',
            zIndex: 9999,
            width: '20rem', // Fixed width
            // height: '4rem', // Fixed height to prevent overlap
            boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none', // Prevent tooltip from interfering with mouse events
            marginBottom: '0.5rem', // Space between tooltip and element
            display: 'flex',
            alignItems: 'center' // Center content vertically
          }}
        >
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            // WebkitLineClamp: 3, // Show max 3 lines
            WebkitBoxOrient: 'vertical',
            width: '100%',
            height: '100%'
          }}>
            {allStandardsText}
          </div>

          {/* Arrow border */}
          <div style={{
            position: 'absolute',
            top: showTop ? 'calc(100% + 0.0313rem)' : 'auto', // Reduced offset for better alignment
            bottom: showTop ? 'auto' : 'calc(100% + 0.0313rem)',
            left: '50%',
            transform: showTop ? 'translateX(-50%)' : 'translateX(-50%) rotate(180deg)',
            width: 0,
            height: 0,
            borderLeft: '0.5625rem solid transparent',
            borderRight: '0.5625rem solid transparent',
            borderTop: '0.5625rem solid black'
          }} />
          
          {/* Arrow pointing down */}
          <div style={{
            position: 'absolute',
            top: showTop ? '100%' : 'auto',
            bottom: showTop ? 'auto' : '100%',
            left: '50%',
            transform: showTop ? 'translateX(-50%)' : 'translateX(-50%) rotate(180deg)',
            width: 0,
            height: 0,
            borderLeft: '0.5rem solid transparent',
            borderRight: '0.5rem solid transparent',
            borderTop: '0.5rem solid white'
          }} />        
        </div>
      )}
    </div>
  );
}; 