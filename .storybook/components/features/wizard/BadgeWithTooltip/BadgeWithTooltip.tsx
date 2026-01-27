import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { MasteryPacing, MasteryStatusPacing } from '@enums';
import { UserBadge } from "@components/shared";
import { MasteryChangeChart } from "@components/features/planner/MasteryChangeChart";
// import { getMasteryKey } from "@utilities";

import "./BadgeWithTooltip.scss";
import { SkilltreeIcon } from "@components/global/icons";

import StatusCard from "@components/features/wizard/StatusCard/StatusCard";
import { SkillCardHeader } from '../SkillCardHeader';

export enum PopoverTemplate {
  PREREQ = "PREREQ",
  TIME_NEEDED = "TIME_NEEDED",
  SIMPLE = "SIMPLE",
  LEFT_SIMPLE = "LEFT_SIMPLE",
  RIGHT_ALIGNED = "RIGHT_ALIGNED",
  TIME_ASSIGNED = "TIME_ASSIGNED",
}

export const getMasteryKey = (pacing: keyof typeof MasteryPacing) => {
  if (!pacing) {
    return MasteryStatusPacing.NO_DATA;
  }
  switch (pacing) {
    case MasteryPacing.AHEAD_OF_GRADE_LEVEL:
      return MasteryStatusPacing.LIKELY_MASTERED;
    case MasteryPacing.AT_GRADE_LEVEL:
      return MasteryStatusPacing.DEVELOPING;
    case MasteryPacing.BELOW_GRADE_LEVEL:
      return MasteryStatusPacing.NOT_DEVELOPED;
    default:
      return MasteryStatusPacing.NO_DATA;
  }
}; 

interface BadgeWithTooltipProps {
  showIcon?: boolean;
  fullName?: string;
  firstName?: string;
  displayName?: string;
  errorCount?: number;
  exposureCount?: number;
  inference?: boolean;
  masteryNow?: keyof typeof MasteryPacing;
  masteryMonday?: keyof typeof MasteryPacing;
  template?: keyof typeof PopoverTemplate;
  skillId?: string;
  domain?: string;
  // Simple tooltip props
  children?: React.ReactNode;
  tooltipContent?: string;
  tooltipContentNode?: React.ReactNode;
  className?: string;
  useLeftAlignment?: boolean;
  useBottomAlignment?: boolean;
  // New prop for dynamic tooltip message based on mastery
  actualMasteryStatus?: keyof typeof MasteryPacing;
}

export const PrerequisiteBox = ({
  exposureCount,
  errorCount,
  masteryNow
}: {
  exposureCount: number;
  errorCount: number;
  masteryNow: keyof typeof MasteryPacing;
}) => {
  const { t } = useTranslation("common");
  const masteryStatusClass = getMasteryKey(masteryNow);
  return(
<div className={`prerequisite-box card-mastery card-mastery-${masteryStatusClass}`}>
  <h4 className="prerequisite-header">
    {t(masteryStatusClass)}
    <span className="dot-indicator" />
  </h4>

  <div className="prerequisite-details">
    <span className="prerequisite-detail">
      {exposureCount} observations
    </span>

    <span className="prerequisite-detail">
      {errorCount} errors
    </span>
  </div>
</div>
  );
};

export const TimeNeededBox = ({
  exposureCount,
  errorCount,
  masteryNow
}: {
  exposureCount: number;
  errorCount: number;
  masteryNow: keyof typeof MasteryPacing;
  inference?: boolean;
}) => {
  const { t } = useTranslation("common");
  const masteryStatusClass = getMasteryKey(masteryNow);
  return(
    <div className={`time-needed-box card-mastery card-mastery-${masteryStatusClass}`}>
      <div className="time-needed-chart">
        <MasteryChangeChart />
      </div>
      <div className="time-needed-details">
        <h4 className="time-needed-header">{t(masteryStatusClass)}</h4>
        <span className="time-needed-detail">
          {exposureCount} observations
        </span>
        <span className="time-needed-detail">
          {errorCount} errors
        </span>
      </div>
    </div>
)}

export const BadgeWithTooltip = ({
  showIcon = false,
  fullName,
  firstName,
  displayName,
  errorCount,
  exposureCount,
  inference,
  masteryNow,
  template = PopoverTemplate.PREREQ,
  children,
  tooltipContent,
  tooltipContentNode,
  domain,
  className,
  useLeftAlignment,
  useBottomAlignment,
  actualMasteryStatus
}: BadgeWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useTranslation("rolloverWizard");
  const { t: planner } = useTranslation("planner");

  // Helper function to get the appropriate tooltip message based on actual mastery status
  const getTooltipMessage = () => {
    if (template !== PopoverTemplate.PREREQ || !actualMasteryStatus) {
      // Fallback to default message for non-prereq templates or when no actual mastery data
      return t(`${template}_MESSAGE`, { firstName, displayName, correctCount: errorCount, exposureCount }) ||
             `${firstName} is most likely not ready for this upcoming lesson. The prerequisite skill "${displayName}" is not developed.`;
    }

    // Use dynamic message based on actual mastery status for prerequisites
    const masteryToMessageKey = {
      [MasteryPacing.AHEAD_OF_GRADE_LEVEL]: 'PREREQ_MESSAGE_MASTERED',
      [MasteryPacing.AT_GRADE_LEVEL]: 'PREREQ_MESSAGE_AT_GRADE_LEVEL', 
      [MasteryPacing.BELOW_GRADE_LEVEL]: 'PREREQ_MESSAGE_BELOW_GRADE_LEVEL',
      [MasteryPacing.NO_DATA]: 'PREREQ_MESSAGE_NO_DATA'
    };

    const messageKey = masteryToMessageKey[actualMasteryStatus] || 'PREREQ_MESSAGE_BELOW_GRADE_LEVEL';
    return t(messageKey, { firstName, displayName, correctCount: errorCount, exposureCount });
  };

  if (template === PopoverTemplate.TIME_ASSIGNED && children) {
    return (
      <div
        className="tooltip-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div className={`custom-tooltip ${useLeftAlignment ? 'custom-tooltip-left' : 'custom-tooltip-right-aligned'}`}>
            <div className="tooltip-title-simple">
              <div className='mb-3'>{planner('estimated_minutes_assigned')}</div>
              <ul className="time-assigned-tooltip-list">
                <li><strong>{ planner('green')}</strong> {planner('green_ideal')}</li>
                <li><strong>{ planner('red')}</strong> {planner('red_too_many_few')}</li>
                <li><strong>{ planner('gray')}</strong> {planner('gray_teacher_modified')}</li>
                <li><strong>{ planner('blue')}</strong> {planner('blue_optimal')}</li>
              </ul>
            </div>
            <div className="arrow-border" />
            <div className="arrow" />
          </div>
        )}
      </div>
    );
  }

  // Add this new case before the existing SIMPLE case
  if (template === PopoverTemplate.LEFT_SIMPLE && children && tooltipContent) {
    return (
      <div
        className="tooltip-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div className="custom-tooltip custom-tooltip-left">
            <div className="tooltip-title-simple">
              {tooltipContent}
            </div>
            <div className="arrow-border" />
            <div className="arrow" />
          </div>
        )}
      </div>
    );
  }

  // Simple mode - just wrap children with tooltip
  if (template === PopoverTemplate.SIMPLE && children && tooltipContent) {
    return (
      <div
        className="tooltip-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div className={`custom-tooltip ${useBottomAlignment ? 'custom-tooltip-bottom' : ''}`}>
            <div className="tooltip-title-simple">
              {tooltipContent}
            </div>
            <div className="arrow-border" />
            <div className="arrow" />
          </div>
        )}
      </div>
    );
  }

  // Original badge mode - require all necessary props
  if (!fullName || !firstName || !displayName || errorCount === undefined || exposureCount === undefined || !masteryNow) {
    return null;
  }

  const badgeColorClass = masteryNow === MasteryPacing.BELOW_GRADE_LEVEL ? 'undeveloped' :
    masteryNow === MasteryPacing.AT_GRADE_LEVEL ? 'developing' :
      masteryNow === MasteryPacing.AHEAD_OF_GRADE_LEVEL ? 'mastered' : 'none';

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="user-context">
        <UserBadge name={fullName} />
        <span className="user-label">{fullName}</span>
        <span className={`badge badge-pill badge-${badgeColorClass}`}>
          {`${errorCount}/${exposureCount}`}
          {showIcon && <SkilltreeIcon />}
        </span>
      </div>
      {showTooltip && (
        <div className={`custom-tooltip ${template === PopoverTemplate.TIME_NEEDED ? 'custom-tooltip--wide' : ''}`}>
          <div className="tooltip-title">
            {getTooltipMessage()}
          </div>
          {template === PopoverTemplate.PREREQ && <>
            <span className="prerequisite-label">
              {t(`${template}_LABEL`, { firstName, displayName, correctCount: errorCount, exposureCount }) || "Prerequisite Skill Mastery"}
            </span>
            <SkillCardHeader skillName={displayName} standards={[]} domain={domain || ""} source={""} skillNameAbbreviation={true} mini={true} hideStandards={true} />
            <StatusCard status={MasteryPacing[masteryNow]} masteryStart={MasteryPacing[masteryNow]} masteryEnd={MasteryPacing[masteryNow]} observations={exposureCount} errors={errorCount} showGraph={false} preReqModal={true} inference={inference}/>
          </>}
          {template === PopoverTemplate.TIME_NEEDED && <StatusCard status={MasteryPacing[masteryNow]} masteryStart={MasteryPacing[masteryNow]} masteryEnd={MasteryPacing[masteryNow]} observations={exposureCount} errors={errorCount} showGraph={false} preReqModal={true} inference={inference}/>}
          <div className="arrow-border" />
          <div className="arrow" />
        </div>
      )}
    </div>
  );
};

export default BadgeWithTooltip;