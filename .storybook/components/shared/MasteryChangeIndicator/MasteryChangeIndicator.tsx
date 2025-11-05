import React from "react";
import { MasteryChange, MasteryChangeText, MasteryPacing } from "@enums";
import "./MasteryChangeIndicator.scss";
import MasteryChangeUpIcon from "/images/icons/mastery-change-up-icon.svg";
import MasteryChangeDownIcon from "/images/icons/mastery-change-down-icon.svg";

interface MasteryChangeIndicatorProps {
  startMastery: MasteryPacing;
  endMastery: MasteryPacing;
}

const getMasteryLevel = (mastery: MasteryPacing): number => {
  switch (mastery) {
    case MasteryPacing.NO_DATA:
      return 0;
    case MasteryPacing.BELOW_GRADE_LEVEL:
      return 1;
    case MasteryPacing.AT_GRADE_LEVEL:
      return 2;
    case MasteryPacing.AHEAD_OF_GRADE_LEVEL:
      return 3;
    default:
      return 0;
  }
};

const calculateMasteryChange = (start: MasteryPacing, end: MasteryPacing): MasteryChange => {
  // First assessment: from NO_DATA to any other status
  if (start === MasteryPacing.NO_DATA && end !== MasteryPacing.NO_DATA) {
    return MasteryChange.FIRST_ASSESSMENT;
  }

  // No change: same status
  if (start === end) {
    return MasteryChange.NO_CHANGE;
  }

  const startLevel = getMasteryLevel(start);
  const endLevel = getMasteryLevel(end);

  // Down: higher level to lower level
  if (startLevel > endLevel) {
    return MasteryChange.DOWN;
  }

  // Up: lower level to higher level
  return MasteryChange.UP;
};

export const MasteryChangeIndicator: React.FC<MasteryChangeIndicatorProps> = ({
  startMastery,
  endMastery
}) => {
  const change = calculateMasteryChange(startMastery, endMastery);

  // Map the enum values to keys for proper lookup
  const changeKeyMap: Record<MasteryChange, keyof typeof MasteryChangeText> = {
    [MasteryChange.FIRST_ASSESSMENT]: 'FIRST_ASSESSMENT',
    [MasteryChange.NO_CHANGE]: 'NO_CHANGE',
    [MasteryChange.DOWN]: 'DOWN',
    [MasteryChange.UP]: 'UP',
  };

  const changeKey = changeKeyMap[change];
  const changeText = MasteryChangeText[changeKey];

  return (
    <div className="mastery-change d-flex align-items-center gap-1">
    {change === MasteryChange.UP && (
      <img
        src={MasteryChangeUpIcon}
        alt="Mastery increased"
        className="mastery-change-icon"
      />
    )}
    {change === MasteryChange.DOWN && (
      <img
        src={MasteryChangeDownIcon}
        alt="Mastery decreased"
        className="mastery-change-icon"
      />
    )}
      <span className="mastery-change-text">
        {changeText}
      </span>
    </div>
  );
};