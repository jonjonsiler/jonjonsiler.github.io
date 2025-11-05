import React from "react";
import './Placeholder.scss';

export interface PlaceholderProps {
  animation?: "glow" | "wave" | "none"; //if no prop is passed, the default animation is glow
  colWidth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; //the default is undefined
  heightInRem?: number;  //the default is undefined
}

export const Placeholder: React.FC<PlaceholderProps> = ({
  animation,
  colWidth,
  heightInRem
}) => {
  const animationClass: string = animation ? `placeholder-${animation}` : "placeholder-glow";
  const colClass: string = colWidth ? `col-${colWidth}` : "";
  return (
    <span 
      data-testid="placeholder-wrapper"
      className={`placeholder-wrapper-span ${animationClass} ${colClass}`} 
      style={{height: `${heightInRem}rem`}}
    >
      <span className={`placeholder-span`}>&nbsp;</span>
    </span>
  );
};
