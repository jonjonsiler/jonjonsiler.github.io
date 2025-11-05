/**
 * This is the container component for the AssessmentStatusWidget written in React functional component style in TypeScript.
 * This container passes the necessary props to the AssessmentStatusWidget.
 * It also handles any actions that need to be dispatched to the Redux store.
 * It handles data fetching (using dummy data in this case).
 * It instantiates the AssessmentStatusWidgetModel and passes it to the AssessmentStatusWidget.
 */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { WidgetAssessmentStatus } from './AssessmentStatus/AssessmentStatus';
import { AsyncLoadingState, AssessmentPeriodWindowType, AssessmentStatusFilter,  WidgetCategory, WidgetStateEnum, WidgetType } from '@enums';
import { WidgetWrapper } from '@components/dashboard';
// import {
//   selectAssessmentStatusWidgetData,
//   fetchAssessmentStatusWidgetData,
//   resetAssessmentStatusWidgetState,
// } from '../store/slices/assessmentStatusWidgetSlice';
// import {
//   dashboardWidgetState,
//   toggleWidget,
// } from '@/store/slices';
import assessmentOutcomesIcon from "/images/icons/brain.png";
// import { findAssessmentWindow, getSchoolYearFromAssessmentCalendar } from '@utilities';
// import { useAssessmentPeriodWindows, useCalendar, useRosterInfo } from '@hooks';
import type { RootState, Student, AssessmentWindow } from '@models';
import { AssessmentStatusWidgetModel } from '@models';
// import { StudentListModal } from './StudentListModal/StudentListModal';

// Define the AssessmentStatusWidgetContainer functional component
export const AssessmentStatusWidgetContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('dashboard');

  // Fetch the AssessmentStatusWidget data from the Redux store
  // const { loading, data, error } = useSelector(
  //   selectAssessmentStatusWidgetData
  // );
  // const { districtId, schoolId, classroomId } = useRosterInfo();
  const students = useSelector((state: RootState) => state.reports?.roster?.data?.student);
  const reportsStatus = useSelector((state: RootState) => state.reports?.roster?.status?.type);
  const [status, setStatus] = useState('none');
  // const { assessment } = useSelector(dashboardWidgetState);
  // const { 
  //   assessmentPeriodWindows,
  //   loading: assessmentPeriodWindowsLoading,
  //   selectedWindow
  // } = useAssessmentPeriodWindows();
  // const { assessmentCalendar, loading: calendarLoading } = useCalendar();

  const loading: AsyncLoadingState = AsyncLoadingState.SUCCESS; // Mocked for Storybook
  const data = {}; // Mocked for Storybook
  const error = null; // Mocked for Storybook
  const districtId = 1000001; // Mocked for Storybook
  const schoolId = 2000001; // Mocked for Storybook
  const classroomId = 3000001; // Mocked for Storybook
  const assessment = {
    status: WidgetStateEnum.EXPANDED
  }; // Mocked for Storybook
  const assessmentCalendar = {}; // Mocked for Storybook
  const calendarLoading = false; // Mocked for Storybook

  const assessmentPeriodWindows = {}; // Mocked for Storybook
  const assessmentPeriodWindowsLoading: boolean = false; // Mocked for Storybook
  const selectedWindow = null; // Mocked for Storybook


  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track previous classroom ID to detect changes
  const prevClassroomIdRef = useRef<string | number | null>(null);

  const entityIdList = useMemo(() => {
    if (!students) return [];
    return students.map((student: Student) => student.id);
  }, [students]);

  const combinedLoadingState: AsyncLoadingState = useMemo(() => {
    if (assessmentPeriodWindowsLoading || reportsStatus === 'PENDING' || !students || calendarLoading) {
      return AsyncLoadingState.LOADING;
    }
    return loading as AsyncLoadingState;
  }, [assessmentPeriodWindowsLoading, reportsStatus, students, loading, calendarLoading]);

  useEffect(() => {
    if (combinedLoadingState === AsyncLoadingState.LOADING || assessmentPeriodWindowsLoading || !students || reportsStatus === 'PENDING' || calendarLoading) {
      setStatus('loading');
    } else if (combinedLoadingState === AsyncLoadingState.ERROR || error) {
      setStatus('error');
    } else if (combinedLoadingState === AsyncLoadingState.SUCCESS && data) {
      setStatus('success');
    } else {
      setStatus('none');
    }
  }, [combinedLoadingState, error, assessmentPeriodWindowsLoading, reportsStatus, students, calendarLoading]);

  const assessmentWindowStatusData = useMemo(() => {
    return {} as AssessmentWindow;
    // return findAssessmentWindow(assessmentPeriodWindows);
  }, [assessmentPeriodWindows]);
  
  // Get the current window type (District vs School assignment)
  const currentWindowType = useMemo(() => {
    if (assessmentWindowStatusData?.activeDistrictWindow) {
      // Find the current active window in assessment period windows to get entity type
      const currentWindow = assessmentPeriodWindows?.find(window => 
        window.current === true && 
        (window.screeningWindowType === 'DistrictAssignment' || 
         window.screeningWindowType === 'SchoolAssignment')
      );
      
      return currentWindow?.screeningWindowType || 'DistrictAssignment';
    }
    return null; // Default fallback
  }, [assessmentWindowStatusData, assessmentPeriodWindows]);


  // Reset loading state when classroom changes
  useEffect(() => {
    const hasClassroomChanged = prevClassroomIdRef.current !== null && prevClassroomIdRef.current !== classroomId;
    if (hasClassroomChanged && classroomId) {
      // dispatch(resetAssessmentStatusWidgetState());
    }
    prevClassroomIdRef.current = classroomId;
  }, [classroomId, dispatch]);

  // Calculate school year date range for filtering assignments (same as student list modal)
  // const schoolYearDates = getSchoolYearFromAssessmentCalendar(assessmentCalendar);
  const schoolYearDates = {startDate: null, endDate: null}; // Mocked for Storybook
  const schoolYearStart = schoolYearDates?.startDate || null;
  const schoolYearEnd = schoolYearDates?.endDate || null;

  const isCurrentWindowSelected = useMemo(() => {
    return !!selectedWindow && 'periodId' in selectedWindow && assessmentWindowStatusData.currentPeriodIdentifier === selectedWindow.periodId as number;
  }, [assessmentWindowStatusData.currentPeriodIdentifier, selectedWindow]);

  // Fetch data when dependencies change (excluding classroomId to avoid race condition)
  // useEffect(() => {
  //   if (entityIdList.length > 0 && schoolId && districtId && assessmentWindowStatusData.currentPeriodIdentifier != null && selectedWindow) {
  //     // Convert selectedWindow to the format expected by the API
  //     let convertedSelectedWindow;

  //     // Check if we're viewing "Latest Assessment Status" (screeningWindowType is null for this view)
  //     const isLatestAssessmentStatus = typeof selectedWindow === 'object' && 'type' in selectedWindow && selectedWindow.type === 'latest-assessment-status';
  //     const isBenchmarkWindowSelected = typeof selectedWindow === 'object' && 'assignmentType' in selectedWindow && selectedWindow.assignmentType === 'BENCHMARK';

  //     // Check if we're in an active window (Benchmark, Progress Monitoring, or SODA)
  //     const { assessmentWindowType, currentPeriodIdentifier } = assessmentWindowStatusData;

  //     // default to latest assessment status
  //     if (isLatestAssessmentStatus) {
  //       convertedSelectedWindow = {
  //         filterType: AssessmentStatusFilter.LATEST,
  //         schoolYearStart,
  //         currentDate: new Date().toISOString().split('T')[0]
  //       };
  //     }
  //     if (
  //       /* if we're in an active benchmark window */
  //       (assessmentWindowType && assessmentWindowType === 'BENCHMARK' && isLatestAssessmentStatus)
  //       /* or the user has selected a benchmark window */
  //       || isBenchmarkWindowSelected
  //     ) {
  //       const { tags } = isBenchmarkWindowSelected ? selectedWindow : assessmentWindowStatusData;
  //       const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];
  //       let benchmarkTag: 'BOY' | 'MOY' | 'EOY' | undefined;
  //       if (tagsArray.includes('BOY') || tagsArray.includes('WINDOW_BOY')) {
  //         benchmarkTag = 'BOY';
  //       } else if (tagsArray.includes('MOY') || tagsArray.includes('WINDOW_MOY')) {
  //         benchmarkTag = 'MOY';
  //       } else if (tagsArray.includes('EOY') || tagsArray.includes('WINDOW_EOY')) {
  //         benchmarkTag = 'EOY';
  //       }
  //       const selectedPeriodId = isBenchmarkWindowSelected && 'periodId' in (selectedWindow as any)
  //         ? (selectedWindow as any).periodId
  //         : null;
  //       const isRealBenchmark = selectedPeriodId !== null && selectedPeriodId !== undefined;

  //       convertedSelectedWindow = {
  //         filterType: AssessmentStatusFilter.BENCHMARK,
  //         // For user-selected system benchmarks, carry null; for active-window-derived case, use current period
  //         value: isBenchmarkWindowSelected ? (isRealBenchmark ? selectedPeriodId : null) : (currentPeriodIdentifier >= 0 ? currentPeriodIdentifier : null),
  //         benchmarkTag
  //       };
  //     } else if (
  //        /* if we're in an active progress monitoring window */
  //       assessmentWindowType 
  //       && assessmentWindowType === "PROGRESS_MONITORING"
  //       && isLatestAssessmentStatus
  //     ) {
  //       convertedSelectedWindow = {
  //         filterType: AssessmentStatusFilter.PROGRESS_MONITOR,
  //         value: currentPeriodIdentifier >= 0 ? currentPeriodIdentifier : null,
  //       };
  //     } else if (
  //       /* if the user has selected a period window */
  //       'screeningWindowType' in selectedWindow 
  //       && selectedWindow.screeningWindowType === 'Period'
  //     ) {
  //       convertedSelectedWindow = {
  //         filterType: AssessmentStatusFilter.PERIOD,
  //         value: selectedWindow.periodId
  //       };
  //     }

  //     // dispatch(fetchAssessmentStatusWidgetData({
  //     //   entityIdList: entityIdList,
  //     //   schoolId: schoolId,
  //     //   districtId: districtId,
  //     //   currentPeriodId: assessmentWindowStatusData.currentPeriodIdentifier,
  //     //   entityRoster: students,
  //     //   assessmentWindowStatus: assessmentWindowStatusData,
  //     //   currentWindowType: currentWindowType,
  //     //   selectedWindow: convertedSelectedWindow,
  //     //   // Add school year date filtering to match student list modal
  //     //   schoolYearStart: schoolYearStart,
  //     //   schoolYearEnd: schoolYearEnd,
  //     // }) as any);
  //   }
  // }, [
  //   dispatch,
  //   entityIdList,
  //   schoolId,
  //   districtId,
  //   assessmentWindowStatusData.currentPeriodIdentifier,
  //   assessmentWindowStatusData.screeningWindowType,
  //   assessmentWindowStatusData.assessmentWindowType,
  //   students,
  //   currentWindowType,
  //   schoolYearStart,
  //   schoolYearEnd,
  //   selectedWindow
  // ]);

  // Function to handle retry when data fails to load
  const handleRetry = () => {
    if (entityIdList.length > 0 && schoolId && districtId && assessmentWindowStatusData.currentPeriodIdentifier) {
      // dispatch(fetchAssessmentStatusWidgetData({
      //   entityIdList: entityIdList,
      //   schoolId: schoolId,
      //   districtId: districtId,
      //   currentPeriodId: assessmentWindowStatusData.currentPeriodIdentifier,
      //   entityRoster: students,
      //   assessmentWindowStatus: assessmentWindowStatusData,
      //   currentWindowType: currentWindowType,
      //   // Add school year date filtering to match the main useEffect
      //   schoolYearStart: schoolYearStart,
      //   schoolYearEnd: schoolYearEnd,
      // }) as any);
    }
  };

  // Instantiate the AssessmentStatusWidgetModel where it can apply business logic to the data as needed
  const assessmentStatusWidgetModel = useMemo(() => {
    return new AssessmentStatusWidgetModel(data);
  }, [data]);

  // Modal handlers
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Calculate modal props from data
  const modalProps = useMemo(() => {
    if (!data || !students) return null;

    const {
      students: assessmentStudents,
      completedDate,
    } = data.classroomAssessmentStatusData.data;
    const districtScreeningSetup = !!assessmentPeriodWindows.find(window => 
      window.screeningWindowType === AssessmentPeriodWindowType.DISTRICT_ASSIGNMENT || 
      window.screeningWindowType === AssessmentPeriodWindowType.SCHOOL_ASSIGNMENT
    );

    // Map assessment students to the format expected by StudentListModal
    const mappedStudents = assessmentStudents.map((student: any) => ({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      assessmentStatus: student.assessmentStatus,
      latestActivityId: student.latestActivityId,
      completedDate: student.completedDate
    }));

    return {
      students: mappedStudents,
      completedDate: completedDate as string,
      currentAssessmentWindow: assessmentWindowStatusData,
      districtScreeningSetup
    };
  }, [data?.classroomAssessmentStatusData?.data, students, assessmentWindowStatusData, assessmentPeriodWindows]);


  return (
    <>
      <WidgetWrapper
        title=""
        overriddenTitle={t('WIDGET_TITLE_ASSESSMENT_STATUS') || 'Assessment Status'}
        loadingState={combinedLoadingState}
        type={WidgetType.ASSESSMENT_STATUS}
        category={WidgetCategory.ASSESS}
        icon={assessmentOutcomesIcon}
        isCollapsed={assessment.status === WidgetStateEnum.COLLAPSED}
        onCollapserHandler={() => {}} // dispatch(toggleWidget({ group: 'assessment', widget: 'status' }))
        id="assessment-status"
        dataTestId="assessment-status-widget">
        <WidgetAssessmentStatus
          isCurrentWindowSelected={isCurrentWindowSelected}
          assessmentWindowStatus={assessmentWindowStatusData}
          data={assessmentStatusWidgetModel}
          widgetLoadingState={combinedLoadingState}
          status={status}
          onRetry={handleRetry}
          onOpenModal={openModal}
        />
      </WidgetWrapper>
      {/* {modalProps && (
        <StudentListModal
          isOpen={isModalOpen}
          onCloseHandler={closeModal}
          {...modalProps}
        />
      )} */}
    </>
  );
};