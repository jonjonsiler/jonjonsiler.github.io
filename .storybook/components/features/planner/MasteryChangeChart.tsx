import React from 'react';

/**
 * TODO: Customize output of the chart:
 *  type of change (UP, DOWN, NONE),
 *  masteryStart,
 *  masteryEnd,
 */
export const MasteryChangeChart = () => (
<figure className="mastery-change-chart">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 98" fill="none">
    <path d="M22 76.379c38.5 4.532 47.25-30.214 84-27.193" stroke="#262626" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="99.5" y="42.5" width="13" height="13" rx="6.5" fill="#ffc60e"/>
    <rect x="99.5" y="42.5" width="13" height="13" rx="6.5" stroke="#c7430a"/>
    <rect x="15.5" y="69.5" width="13" height="13" rx="6.5" fill="#f14668"/>
    <rect x="15.5" y="69.5" width="13" height="13" rx="6.5" fill="url(#A)"/>
    <rect x="15.5" y="69.5" width="13" height="13" rx="6.5" stroke="#ca0a5d"/>
    <rect x="15.5" y="69.5" width="13" height="13" rx="6.5" stroke="#c21f3c"/>
    <defs>
      <pattern id="A" patternContentUnits="objectBoundingBox" width=".5" height=".5">
      <image width="224" height="224" transform="scale(.00223333)" preserveAspectRatio="none" href="data:image/png;base64,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"/></pattern>
    </defs>
  </svg>
</figure>
);