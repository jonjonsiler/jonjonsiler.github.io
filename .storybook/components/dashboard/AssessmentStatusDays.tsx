import React, { act, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AssessmentPeriodWindowType } from "@enums";
// import { useAssessmentPeriodWindows } from "@hooks";
// import { findAssessmentWindow } from "@/features/dashboard/utils";
import { CalendarPlus } from "@components/global/icons";
import type { AssessmentWindow } from "@models";

export const AssessmentStatusDays = ({ 
  handleCalendarIconClick, 
  showScheduleButton = true
}: {
  handleCalendarIconClick: () => void;
  showScheduleButton?: boolean;
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  // const { assessmentPeriodWindows } = useAssessmentPeriodWindows();
  const assessmentPeriodWindows: Array<{
    screeningWindowType: AssessmentPeriodWindowType,
    assignmentType: string,
    startDate: string,
    endDate: string,
    current: boolean,
    tags: string[]
  }> = [];
  // Get window type name based on assessment type and tags
  const getWindowTypeName = (assessmentType?: string | null, tags?: string[] | null) => {
    if (assessmentType === 'BENCHMARK') {
      if (tags && (tags.includes('BOY') || tags.includes('WINDOW_BOY'))) return t('BOY_BENCHMARK');
      if (tags && (tags.includes('MOY') || tags.includes('WINDOW_MOY'))) return t('MOY_BENCHMARK');
      if (tags && (tags.includes('EOY') || tags.includes('WINDOW_EOY'))) return t('EOY_BENCHMARK');
      return t('BENCHMARK_WINDOW');
    }
    if (assessmentType === 'PROGRESS_MONITORING') return t('PROGRESS_MONITORING_WINDOW');
    return t('ASSESSMENT_WINDOW');
  };

  // Determine what to display based on priority logic using findAssessmentWindow
  const displayInfo = useMemo(() => {
    // const assessmentWindowStatus = findAssessmentWindow(assessmentPeriodWindows || []);
    const assessmentWindowStatus: AssessmentWindow = {
      activeDistrictWindow: false,
      daysLeftInCurrentAssessmentWindow: null,
      upcomingWindow: false,
      daysUntilNextAssessmentWindowOpens: null,
      upcomingAssessmentWindow: null,
      previousWindow: false,
      activeAssessmentWindow: null,
      previousAssessmentWindow: null,
      assessmentWindowType: null,
      currentPeriodIdentifier: null,
      tags: null,
      name: null,
      upcomingWindowType: null,
      screeningWindowType: null
    };
    const upcomingWindows = assessmentPeriodWindows
      ?.filter(window => 
        (window.screeningWindowType === AssessmentPeriodWindowType.DISTRICT_ASSIGNMENT || 
         window.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT) &&
        (window.assignmentType === 'BENCHMARK' || window.assignmentType === 'PROGRESS_MONITORING') &&
        new Date(window.startDate) > new Date()
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    // 1. Active screening window - show days left
    if (assessmentWindowStatus.activeDistrictWindow && assessmentWindowStatus.daysLeftInCurrentAssessmentWindow !== null) {
      const daysRemaining = assessmentWindowStatus.daysLeftInCurrentAssessmentWindow;
      
      // Find the active window to get its details
      const activeWindow = assessmentPeriodWindows?.find(window => 
        (window.screeningWindowType === AssessmentPeriodWindowType.DISTRICT_ASSIGNMENT || 
         window.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT) &&
        (window.assignmentType === 'BENCHMARK' || window.assignmentType === 'PROGRESS_MONITORING') &&
        window.current === true
      );
      
      const entityType = activeWindow?.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT ? t('SCHOOL') : t('DISTRICT');
      const windowType = getWindowTypeName(activeWindow?.assignmentType, activeWindow?.tags);
      
      return {
        daysValue: daysRemaining,
        messageLine1: `${daysRemaining === 1 ? t('DAY') : t('DAYS')} ${t('LEFT_IN')} ${entityType}`,
        messageLine2: windowType,
        className: '',
        displayState: 'active'
      };
    }
    
    // 2. Upcoming screening window - show days until
    if (assessmentWindowStatus.upcomingWindow && assessmentWindowStatus.daysUntilNextAssessmentWindowOpens !== null) {
      const daysUntil = assessmentWindowStatus.daysUntilNextAssessmentWindowOpens;
      
      const upcomingWindow = assessmentWindowStatus.upcomingAssessmentWindow 
        ? assessmentPeriodWindows?.find(window => 
            window.startDate === assessmentWindowStatus.upcomingAssessmentWindow?.startDate &&
            window.endDate === assessmentWindowStatus.upcomingAssessmentWindow?.endDate
          )
        : upcomingWindows?.[0];
      
      const entityType = upcomingWindow?.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT ? t('SCHOOL') : t('DISTRICT');
      const windowType = getWindowTypeName(upcomingWindow?.assignmentType, upcomingWindow?.tags);
      
      const result = {
        daysValue: daysUntil,
        messageLine1: `${daysUntil === 1 ? t('DAY') : t('DAYS')} ${t('UNTIL')} ${entityType}`,
        messageLine2: windowType,
        className: 'next-assessment-window',
        displayState: 'next'
      };
      
      return result;
    }

    // 3. No assessment windows available
    return {
      daysValue: 0,
      messageLine1: t('NO_ASSESS_WINDOW'),
      messageLine2: '',
      className: '',
      displayState: 'no-window'
    };
  }, [assessmentPeriodWindows, t]);

  return (
    <div className="days-left-content">
      {(displayInfo.displayState !== 'no-window') && (
      <div className="days-left-content-icon">
        {displayInfo.daysValue}
      </div>
      )}
      <div className="days-left-content-label d-flex flex-column align-items-start">
        <span className={`days-left-content-label-text ${displayInfo.className}`}>
          {displayInfo.messageLine1}
        </span>
        {(displayInfo.displayState !== 'no-window') && (
        <span className={`days-left-content-label-text ${displayInfo.className}`}>
          {displayInfo.messageLine2}
        </span>
        )}
      </div>
      {showScheduleButton && (
        <button className="calendar-icon-button" onClick={handleCalendarIconClick}>
          <CalendarPlus color="#80089D" alt="calendar" />
        </button>
      )}
    </div>
  );
}