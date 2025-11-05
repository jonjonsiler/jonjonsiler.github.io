import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AsyncLoadingState, StatusType } from "@enums";
import type { RootState, AssessmentStatusWidgetModelInterface, AssessmentWindow } from "@models";
import { AssessmentStatusDays, PeriodSelectionDropdown, WidgetDataReloadButton } from "@components/dashboard";
import { DonutChart } from "@components/global";
// import { AmiraTooltip, AmiraTooltipRef } from "@components/shared";

import './AssessmentStatus.scss';
import { CalendarPlus } from "@components/global/icons";


export type AssessmentStatusWidgetProps = {
  data: AssessmentStatusWidgetModelInterface
  widgetLoadingState: string
  status: string
  onRetry: () => void
  onOpenModal: () => void,
  assessmentWindowStatus: AssessmentWindow,
  isCurrentWindowSelected: boolean
}

export const NWEAAssessmentStatus = ({ }) => {
  const { t } = useTranslation('dashboard');
  return (<div className="schedule-body" >
    <h6><strong>{t('NWEA_ASSESSMENT_STATUS_NO_ASSESSMENTS')}</strong></h6>
    <p>{t('NWEA_ASSESSMENT_STATUS_NO_ASSESSMENTS_2')}</p>
  </div>);
};

export const NoAssessmentData = () => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="schedule-body">
      <p>{t('NO_ASSESS_DATA')}</p>
    </div>
  );
}

export const PERIOD_WINDOW_NOTICE_DAYS = 5;

export const WidgetAssessmentStatus: React.FC<AssessmentStatusWidgetProps> = ({
  data: {
    completePercentage,
    totalAssessmentCount,
    completeCount,
    scheduledCount,
    inProgressCount,
    underReviewCount,
    requireActionCount,
  },
  status,
  onRetry,
  onOpenModal,
  assessmentWindowStatus,
  isCurrentWindowSelected
}) => {
  const { t } = useTranslation('dashboard');
  // const { entitlements: { branding } } = useUserData();
  const branding = "nwea-map-tutor"; // Mocked for Storybook
  const { state: locationState, pathname } = useLocation();
  const loading = useSelector((state: RootState) => state.assessmentStatusWidget.loading);
  // const { assessmentPeriodWindows } = useAssessmentPeriodWindows();
  // const assessmentPeriodWindows: Array<{screeningWindowType: AssessmentPeriodWindowType}> = [];
  // const [hasShownTooltip, setHasShownTooltip] = useState(false);
  // const testingWindowTooltipRef = useRef<AmiraTooltipRef>(null);
  const showStudentList = locationState?.showStudentList || false;

  const hasActive = assessmentWindowStatus?.activeDistrictWindow;
  // const hasUpcoming = assessmentWindowStatus?.upcomingWindow;
  // const hasPrevious = assessmentWindowStatus?.previousWindow;
  // const notInAssessmentWindowAndHasUpcoming = !assessmentWindowStatus?.activeDistrictWindow && assessmentWindowStatus?.upcomingWindow;
  // const noWindows = !assessmentWindowStatus?.activeDistrictWindow && !assessmentWindowStatus?.upcomingWindow && !assessmentWindowStatus?.previousWindow;
  // const districtScreeningSetup = !!assessmentPeriodWindows.find(window => 
  //   window.screeningWindowType === AssessmentPeriodWindowType.DISTRICT_ASSIGNMENT || 
  //   window.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT
  // );
  
  // Generate the current data label based on what assessment data is being displayed
  const getCurrentDataLabel = () => {
    // The data being displayed is based on the ACTIVE assessment window or current period
    // This is different from upcoming windows which are shown in the status message
    const periodNumber = assessmentWindowStatus?.currentPeriodIdentifier;

    if (hasActive) {
      // If there's an active district assignment, show what type it is
      const isBenchmark = assessmentWindowStatus?.assessmentWindowType === 'BENCHMARK';
      const tags = assessmentWindowStatus?.tags || [];
      
      if (isBenchmark) {
        if (tags.includes('BOY') || tags.includes('WINDOW_BOY')) return t('BOY_BENCHMARK');
        if (tags.includes('MOY') || tags.includes('WINDOW_MOY')) return t('MOY_BENCHMARK');
        if (tags.includes('EOY') || tags.includes('WINDOW_EOY')) return t('EOY_BENCHMARK');
        return t('BENCHMARK');
      } 
      else if (periodNumber) {
        return t('PERIOD_WINDOW', { periodNumber });
      }
      else {
        return t('ASSESSMENT');
      }

    }
    // For all other cases, show the current period assessment data
    // This covers: no active window, upcoming windows, period-based data, etc.
    else if (periodNumber) {
      return t('PERIOD_WINDOW', { periodNumber }) + ' ' + t('ASSESSMENT');
    }
    else {
      return t('ASSESSMENT') + ' Data';
    }
  };

  const currentDataLabel = getCurrentDataLabel();

  // const shouldShowTooltip = (timeInDays = 5) => {
  //   const currentPeriod = assessmentPeriodWindows.find(({ current, screeningWindowType })=> current && screeningWindowType.toUpperCase() === "PERIOD"); 
  //   const { startDate } = currentPeriod || {};
  //   console.log('shouldShowTooltip', {
  //     currentPeriod,
  //     hasActive,
  //     startDate,
  //   });

  //   if (hasActive) {
  //     return false;
  //   }
    
  //   // Try different possible date properties
  //   if (!startDate) {
  //     return false;
  //   }
  //   const now = new Date();
  //   const boundary = new Date(now.getTime() - (timeInDays * 24 * 60 * 60 * 1000));
  //   const periodStartDate = new Date(startDate);
  //   const isRecent = periodStartDate >= boundary && periodStartDate <= now;
  //   return isRecent;
  // }

  const chartData = [
    { type: StatusType.COMPLETE, value: completeCount },
    { type: StatusType.SCHEDULED, value: scheduledCount },
    { type: StatusType.IN_PROGRESS, value: inProgressCount },
    { type: StatusType.UNDER_REVIEW, value: underReviewCount },
    { type: StatusType.ACTION_NEEDED, value: requireActionCount }
  ];

  // useEffect(() => {
  //   if (!hasShownTooltip && testingWindowTooltipRef.current && shouldShowTooltip(PERIOD_WINDOW_NOTICE_DAYS)) {
  //     if (testingWindowTooltipRef.current) {
  //       testingWindowTooltipRef.current.show();
  //       setHasShownTooltip(true); // Mark as shown to prevent repeated displays
  //     }
  //   }
  // }, [testingWindowTooltipRef?.current]);

  useEffect(() => {
    if (showStudentList) {
      onOpenModal();
    }
  }, [showStudentList, onOpenModal]);

  // Open if you're on the page
  useEffect(() => {
    const handleOpenStudentListModal = () => {
      onOpenModal();
    };
    window.addEventListener('openStudentListModal', handleOpenStudentListModal);
    return () => {
      window.removeEventListener('openStudentListModal', handleOpenStudentListModal);
    };
  }, [onOpenModal]);

  // Open if you're off the page
  useEffect(() => {
    if (locationState?.openStudentListModal) {
      onOpenModal();
      
      // Clear the state to prevent reopening on subsequent renders
      // We need to replace the current history entry to remove the state
      window.history.replaceState({}, document.title, pathname);
    }
  }, [
    locationState?.openStudentListModal, 
    locationState?.timestamp, 
    pathname,
    locationState?.showStudentList,
    onOpenModal
  ]);

  const renderLabel = () => {
    return (
      <div className="donut-chart-data-label">{currentDataLabel}</div>
    );
  };

  const isNWEA = useMemo(() => branding === 'nwea-map-tutor', [branding]);
  
  
  if (status === 'error' || loading === AsyncLoadingState.ERROR) {
    return <AssessmentStatusError onRetry={onRetry} />
  }

  // Determine if we should show the donut chart (when there are assessments)
  const shouldShowDonutChart = totalAssessmentCount > 0;
  return (
    <div className="widget-body widget-assess-body">
      <PeriodSelectionDropdown />
      {shouldShowDonutChart ? (
        // Show donut chart when there are assessments
        <DonutChart
          data={chartData}
          completePercentage={completePercentage}
          handleChartButtonClick={onOpenModal}
        />
      ) : (
        // Show schedule button or NWEA status when there are no assessments
        isNWEA ? (
          <NWEAAssessmentStatus />
        ) : (
          isCurrentWindowSelected ? (
            <div className="schedule-body">
              <button type="button" className="schedule-icon-button" onClick={onOpenModal}>
                <CalendarPlus color="#80089D" alt="calendar" />
                <div className="schedule-body-text">
                  {t('SCHEDULE')}
                </div>
              </button>
            </div>
          ): (
            <NoAssessmentData />
          )
        )
      )}
      <AssessmentStatusDays
        handleCalendarIconClick={onOpenModal}
        showScheduleButton={!isNWEA}
      />
    </div>
  );
};

export const AssessmentStatusError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="widget-body widget-assess-body assess-status-error d-flex flex-column align-items-center justify-content-center text-center">
      <div className="d-flex flex-column align-items-center justify-content-center assess-status-error-inner">
        <div className="data-failed-text mb-3 font-weight-bold">{t('DATA_FAILED_TO_LOAD')}</div>
        <WidgetDataReloadButton onReload={onRetry} />
      </div>
    </div>
  );
}