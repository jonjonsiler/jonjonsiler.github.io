import React from 'react';
import './UserBadge.scss';

type StudentIconProps = {
  name: string;
}

export const UserBadge: React.FC<StudentIconProps> = ({name}) => {
  const calculateDynamicColor = (userName: string): string => {
    let hash = 0;
    // Create a hash value based on the name
    for (let i = 0; i < userName.length; i++) {
      hash = userName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convert the hash to an HSL color for more dynamic, visually consistent colors
    const h = Math.abs(hash % 360); // Hue: 0 - 360
    const s = 70; // Saturation: 70%
    const l = 50; // Lightness: 50%
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const getInitials = (fullName: string): string => {
    const nameParts = fullName.trim().split(/\s+/); // Split the name by spaces
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
  };

  return (
  <i 
    className="user-badge"
    style={{
      backgroundColor: calculateDynamicColor(name),
    }}>{getInitials(name)}
  </i>
)};