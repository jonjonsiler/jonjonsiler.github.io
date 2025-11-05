import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import moment from 'moment';

import { MasteryStatus,AsyncLoadingState, WidgetCategory, WidgetType } from "@enums";
import { getMondayFridayDates } from "@utilities";

// Components
import { 
  WidgetWrapper,
  IndividualLearningPath,
  CurriculumAlignment,
  MiniLessonCard,
  PlanningSummary,
  WidgetDataReloadButton
} from "@components/dashboard";

// Resources and assets
import "./WeeklyPlanContainer.scss";
import { Arrow } from "@components/global/icons";
import plannerIcon from "/images/icons/widget-instruct.svg";
import alertIcon from "/images/icons/alert.svg";

interface WeeklyPlanContainerProps {
  modeOne: boolean;
  modeTwo: boolean;
  isInstructSetup: boolean;
}

// A flag to enable/disable the planner compare feature
const PLANNER_COMPARE = true;

export const WeeklyPlanContainer: React.FC<WeeklyPlanContainerProps> = ({
  modeOne,
  modeTwo,
  isInstructSetup
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  // const { data: weeklyPlanData, failedToLoad, reloadData } = useWeeklyPlan();
  // const loading = useSelector(selectWeeklyPlanIsLoading);
  // const { instruct } = useSelector(dashboardWidgetState);
  // const { students, classroomId } = useRosterInfo();
  // const { isComparable, hasRollover, ...planningSummary } = usePlannerCompare();
  // const { reTeachFocusSkills } = useReTeachData();
  // const { prerequisiteSkills, redKids } = usePreTeachData();
  const failedToLoad = false;
  const reloadData = () => {};
  const weeklyPlanData = {
    assignments: [],
    curriculum: {
      id: "curriculum-1",
      name: "Sample Curriculum",
      tracks: [],
    },
    curTrack: {
      label: "Track 1",
    },
    dateFrom: undefined,
    dateTo: undefined,
  }
  const { curriculum, curTrack } = weeklyPlanData ?? {};
  const loading = false;
  const students = [] as any[];
  const classroomId = "classroom-1";
  const isComparable = true;
  const hasRollover = false;
  const planningSummary = {} as any;
  const reTeachFocusSkills = [] as Array<{ students: Array<{ fulfillment: Array<any> }> }>;
  const prerequisiteSkills = [] as any[];
  const redKids = [] as any[]; 
  
  const hasReTeachData = useMemo(() => {
    return reTeachFocusSkills && reTeachFocusSkills.length > 0 &&
           reTeachFocusSkills.some(skill => {
             return skill.students.some(student => 
               student.fulfillment && student.fulfillment.length > 0
             );
           });
  }, [reTeachFocusSkills]);

  const hasPrerequisiteData = useMemo(() => {
    return prerequisiteSkills && prerequisiteSkills.length > 0 && redKids && redKids.length > 0;
  }, [prerequisiteSkills, redKids]);

  const showRolloverComparison = useMemo(() => {
    return PLANNER_COMPARE &&
           isComparable &&
           !hasRollover &&
           (hasReTeachData || hasPrerequisiteData);
  }, [isComparable, hasRollover, hasReTeachData, hasPrerequisiteData]);


  // IRIP generation state - use ref to prevent resets during re-renders
  const [isGeneratingIRIPs, setIsGeneratingIRIPs] = useState(false);
  // const [iripProgress, setIripProgress] = useState(0);
  // const isGeneratingRef = useRef(false);


  // Rollover selectors
  // const rolloverAssignments = useSelector(selectRolloverAssignments);
  const rolloverAssignments = [];

  const lessons = useMemo(() => (curriculum?.tracks && curTrack?.label
    ? curriculum.tracks.find((t) => t.name === curTrack?.label)
      : null
  ),
  [ curriculum?.tracks, curTrack?.label, rolloverAssignments?.length]
  );

  const hasLessonUnits = useMemo(() => lessons && lessons.units.length > 0, [lessons]);

  // Find the next week that has lessons
  const findNextWeekWithLessons = useMemo(() => {
    try {
      if (!weeklyPlanData?.assignments || weeklyPlanData.assignments.length === 0) {
        return null;
      }

      const currentDate = weeklyPlanData?.dateFrom ? new Date(weeklyPlanData.dateFrom) : new Date();
      
      // Step 1: Get all CLASS and DISTRICT assignments
      const classAndDistrictAssignments = weeklyPlanData.assignments
        .filter(assignment => {
          const entityType = (assignment as any).entityType;
          return entityType === 'CLASS' || entityType === 'DISTRICT';
        });

      // Step 2: Get all parentIds from CLASS assignments
      const classParentIds = new Set(
        classAndDistrictAssignments
          .filter(assignment => (assignment as any).entityType === 'CLASS')
          .map(assignment => (assignment as any).parentId)
          .filter(parentId => parentId != null) // Remove null/undefined parentIds
      );

      // Step 3: Filter out DISTRICT assignments that match CLASS assignment parentIds
      const filteredAssignments = classAndDistrictAssignments
        .filter(assignment => {
          const entityType = (assignment as any).entityType;
          const assignmentId = (assignment as any).assignmentId;
          
          // Keep all CLASS assignments
          if (entityType === 'CLASS') {
            return true;
          }
          
          // For DISTRICT assignments, only keep if assignmentId is NOT in the CLASS parentIds set
          if (entityType === 'DISTRICT') {
            return !classParentIds.has(assignmentId);
          }
          
          return false;
        });

      console.log('filteredAssignments', filteredAssignments);

      // Step 4: Find the next assignment after the current date
      const futureAssignments = filteredAssignments
        .filter(assignment => {
          if (!assignment.dateFrom) return false;
          const assignmentDate = new Date(assignment.dateFrom);
          return assignmentDate > currentDate;
        })
        .sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());
      
      if (futureAssignments.length > 0) {
        const nextAssignment = futureAssignments[0];
        const nextAssignmentDate = new Date(nextAssignment.dateFrom);
        
        // Find the Monday-Friday week that contains this assignment
        const [mondayDate, fridayDate] = getMondayFridayDates(0, nextAssignmentDate);
        
        return { dateFrom: mondayDate, dateTo: fridayDate };
      }
      
      return null;
    } catch (error) {
      console.error('Error in findNextWeekWithLessons:', error);
      return null;
    }
  }, [weeklyPlanData?.assignments, weeklyPlanData?.dateFrom]);

  // Handler to navigate to the next week with lessons
  const handleGoToNextLesson = () => {
    if (findNextWeekWithLessons) {
      // Dispatch Redux action to update the week dates (like planner header does)
      // dispatch(updateWeeklyPlanDates({
      //   dateFrom: findNextWeekWithLessons.dateFrom,
      //   dateTo: findNextWeekWithLessons.dateTo
      // }));
      
      // Navigate to planner page (it will pick up dates from Redux state)
      navigate('/planner');
    }
  };

  useEffect(() => {
    if (!classroomId) return;

    const [df, dt] = getMondayFridayDates();
    const dateFrom = weeklyPlanData?.dateFrom ?? df;
    const dateTo   = weeklyPlanData?.dateTo   ?? dt;

    // dispatch(updateWeeklyPlanDates({ dateFrom, dateTo }));
  }, [classroomId]);

  const alignment = useMemo(() => {
    if (!curriculum?.name || modeOne) return null;
    return <CurriculumAlignment curriculumName={curriculum.id} />
  }, [curriculum?.name])

  // Listen for IRIP generation progress updates
  useEffect(() => {
    const handleProgressUpdate = (event: any) => {
      const { isGenerating, progress } = event.detail;
      setIsGeneratingIRIPs(isGenerating);
      setIripProgress(progress || 0);
    };

    window.addEventListener('iripProgress', handleProgressUpdate);
    return () => window.removeEventListener('iripProgress', handleProgressUpdate);
  }, []);

  // Simple IRIP generation trigger - dispatches event to existing IRIPDocumentGenerator
  // const handleGenerateIRIPs = () => {
  //   if (isGeneratingIRIPs) return; // Prevent multiple clicks

  //   // Set local state to generating immediately
  //   setIsGeneratingIRIPs(true);
  //   setIripProgress(0);

  //   // Pass students data through the event since IRIPDocumentGenerator might not have access to it on dashboard
  //   const event = new CustomEvent('generateIRIPs', {
  //     detail: {
  //       students: students,
  //       weeklyPlan: weeklyPlanData
  //     }
  //   });
    
  //   window.dispatchEvent(event);
    
  //   // Set a timeout to reset state if no progress is made
  //   setTimeout(() => {
  //     console.log('[WeeklyPlanContainer] ⚠️ Timeout check - still generating:', isGeneratingIRIPs);
  //   }, 5000);
  // };

  const renderFooter = () => (
    <footer className="d-flex w-100 justify-content-between manage-instruct-link">
      <NavLink className="btn btn-link ms-auto" to="/planner">
        <span>{t("MANAGE_PLAN")}</span>
        <i className="icon"><Arrow /></i>
      </NavLink>
    </footer>
  );

  return (
    <WidgetWrapper
      title=''
      overriddenTitle={
        !isInstructSetup ? t("INSTRUCT") || "INSTRUCT" :
        modeTwo ? t("INSTRUCT_WEEKLY_PLAN") || "INSTRUCT Weekly Plan" : t("INSTRUCT_LEARNING_PATHS") || "INSTRUCT Learning Paths"
      }
      type={WidgetType.WEEKLY_PLAN}
      category={WidgetCategory.INSTRUCT}
      icon={plannerIcon}
      isCollapsed={false}
      loadingState={loading ? AsyncLoadingState.LOADING : AsyncLoadingState.NONE}
      dataTestId="weekly-plan-widget"
      alignment={alignment}
    >
      <hr className="widget-divider" />

      <div className="px-2">
      {
        !isInstructSetup ? (
          <div className="d-flex gap-1 justify-content-center align-items-center mb-5 mt-4 instruct-plan-alert">
            <img
              src={alertIcon.src}
              alt={t("DISTRICT_SETUP_REQUIRED") || "District setup required"}
            />
            {t("DISTRICT_NOT_SETUP_INSTRUCT")}
          </div>
        ) :
        modeOne ? (
          <IndividualLearningPath />
        ) :
        modeTwo ? (
          <>
            {failedToLoad ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center p-4 widget-body"
                style={{ height: "14rem" }}>
                <div className="data-failed-text mb-3 font-weight-bold">
                  {t("DATA_FAILED_TO_LOAD")}
                </div>
                <WidgetDataReloadButton onReload={reloadData} />
              </div>
            ) : showRolloverComparison ? (
              <>
                <PlanningSummary {...planningSummary} />
                <footer className="d-flex w-100 justify-content-between manage-instruct-link">
                  <NavLink className="btn btn-link ms-auto" to="/planner/rollover">
                    <span>{t("DIFFERENTIATE_INSTRUCTION")}</span>
                    <i className="icon"><Arrow /></i>
                  </NavLink>
                </footer>
              </>
            ) : hasLessonUnits ? (
              <>
                <div className="d-flex gap-3 mini-lesson-card-bg">
                  {lessons?.units.map((unit) => {
                    return unit.lessons.map(
                      (
                        {
                          name: lessonName,
                          completionPercentage: percentComplete,
                          dateFrom,
                          masteryData,
                        },
                        index
                      ) => (
                        <MiniLessonCard
                          key={`${unit.name}-${lessonName}-${index}`}
                          date={moment(dateFrom.split(" ")[0], "YYYY-MM-DD").toDate()}
                          percentComplete={percentComplete}
                          lessonName={lessonName}
                          unitName={unit.name}
                          mastery={
                            masteryData && masteryData.length > 1
                              ? // TODAY mastery data always on index 1
                                masteryData[1].data
                                  .filter(item => item.label !== "no_data") // Exclude "No Data" from RAG calculation
                                  .reduce(
                                    (acc, cur) => {
                                      if (cur.value > acc.value) {
                                        acc = {
                                          label:
                                            cur.label === "mastered"
                                              ? MasteryStatus.LIKELY_MASTERED
                                              : cur.label === "developing"
                                                ? MasteryStatus.DEVELOPING
                                                : cur.label === "undeveloped"
                                                  ? MasteryStatus.NOT_DEVELOPED
                                                  : MasteryStatus.NO_DATA,
                                          value: cur.value,
                                        };
                                      }
                                      return acc;
                                    },
                                    { label: MasteryStatus.NO_DATA, value: 0 } as {
                                      label: MasteryStatus;
                                      value: number;
                                    }
                                  ).label
                              : MasteryStatus.NO_DATA
                          }
                        />
                      )
                    );
                  })}
                </div>
                {renderFooter()}
              </>
            ) : (
              <>
                <div className="d-flex flex-column gap-3 justify-content-center align-items-center mb-5 mt-4 instruct-plan-alert">
                  <div className="d-flex gap-1 justify-content-center align-items-center">
                    <img
                      src={alertIcon}
                      alt={
                        t("WIDGET_NOTICE_WEEKLY_PLAN_EMPTY") ??
                        "empty instructional plan"
                      }
                    />
                    {t("WIDGET_NOTICE_WEEKLY_PLAN_EMPTY")}
                  </div>
                  {findNextWeekWithLessons && (
                    <button 
                      className="btn btn-link" 
                      onClick={handleGoToNextLesson}
                    >
                      <span>{t("WIDGET_CTA_GO_TO_NEXT_LESSON")}</span>
                      <i className="icon"><Arrow /></i>
                    </button>
                  )}
                </div>
                {!findNextWeekWithLessons && renderFooter()}
              </>
            )}
          </>
        ) : ''
      }
      </div>
    </WidgetWrapper>
  );
};

export default WeeklyPlanContainer;
