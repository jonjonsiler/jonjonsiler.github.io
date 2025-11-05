import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useAmiraMessage } from "../AmiraMessageContext";
import { UserBadge } from "@components/shared";
import { Arrow } from "@components/global/icons";
import { StatusCard } from "@components/shared";
// import { selectWeeklyPlanData, updateWeeklyPlanDates } from "@/store/slices";
import { AsyncLoadingState, MasteryPacing } from "@enums";
import type { RootState, AppDispatch, WeeklyPlanStateData } from "@models";
import "./SkillGapNeedsAttention.scss";

interface StudentSkillNeedsAttention {
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  lessonName: string;
  currentMastery: MasteryPacing;
  observations: number;
  errors: number;
}

export const SkillGapNeedsAttention: React.FC = () => {
  const { t } = useTranslation("alerts");
  const navigate = useNavigate();
  // const dispatch = useDispatch<AppDispatch>();
  const { alerts, activeIndex, onRemoveStudentFromAlert, onToggleModal } =
    useAmiraMessage();
  const [studentSkillData, setStudentSkillData] = useState<StudentSkillNeedsAttention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState<string>("");
  const [pendingNavigation, setPendingNavigation] = useState<{
    targetWeek: string;
    navigationState: any;
    studentId: string;
  } | null>(null);

  // Get current alert and weekly plan data
  const currentAlert = alerts[activeIndex];
  // const weeklyPlanData = useSelector(selectWeeklyPlanData);
  const weeklyPlanData: WeeklyPlanStateData = {
    studentAssignmentInfo: [],
    assignments: [],
    dateFrom: "",
    dateTo: "",
    curriculumInfo: [],
    curriculum: {
        name: "TOP Curriculum",
        id: "ABC123",
        dateTo: new Date().toString(),
        dateFrom: new Date().toString(),
        tracks: []
    },
    curTrack: {
      label: "Default Track",
      value: "default"
    },
    stories: {},
    resources: [],
    mastery: {},
    resourcesFetchQueue: [],
    masteryFetchQueue: [],
    crudAssignmentQueue: [],
    crudResponseByLessonPlanId: [],
    searchedStories: [],
    fetchSkillResourcesLoading: 0,
    mutateAssignmentsLoading: AsyncLoadingState.NONE,
    students: []
  }; // Mocked for Storybook

  // Get students and classroom data from Redux store
  const roster = useSelector((state: RootState) => state.reports?.roster);
  const classroom = roster?.ui?.selections?.classroom;
  const studentsRoster = roster?.data?.student || [];

  const alertStudentIds = currentAlert?.studentIds || [];

  // Filter students to only include those in the current alert
  const students = useMemo(() => {
    const filteredStudents = studentsRoster
      .filter((s: any) => {
        const classroomMatch = s.classroom_id.includes(`${classroom?.id}`);
        const studentIdMatch =
          alertStudentIds.includes(s.id) ||
          alertStudentIds.includes(parseInt(s.id)) ||
          alertStudentIds.includes(s.id.toString());

        return classroomMatch && studentIdMatch;
      })
      .map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        grade: s.grade,
      }));

    return filteredStudents;
  }, [studentsRoster, classroom?.id, alertStudentIds]);

  useEffect(() => {
    const processAlertData = () => {
      if (!students.length) {
        setIsLoading(false);
        return;
      }

      if (
        !(currentAlert as any)?.skillId ||
        !(currentAlert as any)?.lessonPlanId
      ) {
        console.error("Alert missing required data:", {
          skillId: (currentAlert as any)?.skillId,
          lessonPlanId: (currentAlert as any)?.lessonPlanId,
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const skillData: StudentSkillNeedsAttention[] = [];

        // Extract alert data including metadata
        const skillId = (currentAlert as any).skillId;
        const lessonPlanId = (currentAlert as any).lessonPlanId;
        const currentMastery = (currentAlert as any).pacingEnding || (currentAlert as any).pacingStarting;
        const alertObservations = (currentAlert as any).exposureDelta || 0;
        const alertErrors = (currentAlert as any).errorDelta || 0;

        // Find the lesson and skill information from curriculum info
        let skillName = skillId; // fallback
        let lessonName = "Unknown Lesson";

        // First try to find lesson in curriculumInfo (contains broader lesson data)
        if (weeklyPlanData?.curriculumInfo?.length) {
          const curriculumLesson = weeklyPlanData.curriculumInfo.find(
            lesson => lesson.lessonId === lessonPlanId
          );
          
          if (curriculumLesson) {
            lessonName = curriculumLesson.lessonDisplayName || curriculumLesson.lessonName || "Unknown Lesson";
            
            // Find the skill within the lesson
            const skill = curriculumLesson.skills?.find(s => s.skillId === skillId);
            if (skill) {
              skillName = skill.displayName || skill.skillName || skillId;
            }
          }
        }

        // Fallback to current week curriculum if not found in curriculumInfo
        if (lessonName === "Unknown Lesson" && weeklyPlanData?.curriculum?.tracks?.length) {
          const lesson = weeklyPlanData.curriculum.tracks
            .flatMap(track => track.units)
            .flatMap(unit => unit.lessons)
            .find(lesson => lesson.lessonPlanId === lessonPlanId);

          if (lesson) {
            lessonName = lesson.name || lesson.lessonName || "Unknown Lesson";

            // Find the skill within the lesson
            const skill = lesson.skills.find(s => s.skillId === skillId);
            if (skill) {
              skillName = skill.displayName || skill.skillName || skillId;
            }
          }
        }

        // Create skill data entries for all students
        students.forEach(
          (student: {
            id: string;
            firstName: string;
            lastName: string;
            grade: string;
          }) => {
            skillData.push({
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              skillId,
              skillName,
              lessonName,
              currentMastery: currentMastery as MasteryPacing,
              observations: alertObservations,
              errors: alertErrors,
            });
          }
        );

        setStudentSkillData(skillData);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error processing alert data:", error);
        setIsLoading(false);
      }
    };

    if (currentAlert && students.length >= 0) {
      processAlertData();
    }
  }, [currentAlert, students, weeklyPlanData]);

  // Watch for week changes and navigate when ready
  useEffect(() => {
    if (pendingNavigation && weeklyPlanData?.dateFrom === pendingNavigation.targetWeek) {
      // Week has changed, now navigate
      setNavigationStatus("Opening lesson...");
      navigate('/planner/lesson', { state: pendingNavigation.navigationState });
      
      // Clean up immediately after navigation
      onRemoveStudentFromAlert(currentAlert.id, parseInt(pendingNavigation.studentId));
      onToggleModal(false);
      
      // Clear pending navigation
      setPendingNavigation(null);
    }
  }, [weeklyPlanData?.dateFrom, pendingNavigation, navigate, currentAlert, onRemoveStudentFromAlert, onToggleModal]);

  // Cleanup pending navigation on unmount
  useEffect(() => {
    return () => {
      setPendingNavigation(null);
    };
  }, []);

  const handleStudentClick = (studentId: string) => {
    if (currentAlert) {
      // Get the lesson plan ID and skill ID from the alert
      const lessonPlanId = (currentAlert as any).lessonPlanId;
      const skillId = (currentAlert as any).skillId;
      
      // Find the student data to get more context
      const studentData = studentSkillData.find(data => data.studentId === studentId);
      
      // Check if lessonPlanId exists and is valid
      if (!lessonPlanId) {
        console.error("❌ No lessonPlanId found in alert!");
        return;
      }
      
      // Create navigation state to go to lesson
      const navigationState = { 
        lessonPlanId: lessonPlanId
      };
      
      // Check if this lesson exists in current weekly plan data
      let lessonExists = false;
      if (weeklyPlanData?.curriculum?.tracks?.length) {
        const allLessons = weeklyPlanData.curriculum.tracks
          .flatMap(track => track.units)
          .flatMap(unit => unit.lessons);
        
        lessonExists = !!allLessons.find(lesson => lesson.lessonPlanId === lessonPlanId);
      }
        
      if (!lessonExists) {
        // Show loading state
        setIsNavigating(true);
        setNavigationStatus("Finding correct week...");
        
        // Find the lesson in curriculumInfo to get its date
        const lessonInCurriculumInfo = weeklyPlanData?.curriculumInfo?.find(
          lesson => lesson.lessonId === lessonPlanId
        );
        
        if (lessonInCurriculumInfo) {
          // Calculate the Monday of the week for this lesson
          const lessonMoment = moment(lessonInCurriculumInfo.lessonDateFrom);
          const targetWeek = lessonMoment.clone().startOf('isoWeek').format('YYYY-MM-DD');
          
          if (targetWeek !== weeklyPlanData?.dateFrom) {
            setNavigationStatus("Changing to week " + targetWeek + "...");
            
            // Calculate the Friday (end of week) for the target week
            const targetWeekEnd = moment(targetWeek).add(4, 'days').format('YYYY-MM-DD');
            
            // Set up pending navigation to trigger after week change
            setPendingNavigation({
              targetWeek,
              navigationState,
              studentId
            });
            
            // Update the weekly plan dates using Redux action
            // dispatch(updateWeeklyPlanDates({
            //   dateFrom: targetWeek,
            //   dateTo: targetWeekEnd
            // }));
            
            return;
          }
        } else {
          console.error("❌ Lesson not found - falling back to planner");
          navigate('/planner');
          onRemoveStudentFromAlert(currentAlert.id, parseInt(studentId));
          onToggleModal(false);
          return;
        }
      }
      
      // Lesson is in current week - show loading and navigate
      setIsNavigating(true);
      setNavigationStatus("Opening lesson...");
      
      // Navigate to lesson page
      navigate('/planner/lesson', { state: navigationState });
      
      // Clean up immediately after navigation
      onRemoveStudentFromAlert(currentAlert.id, parseInt(studentId));
      onToggleModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="skill-gap-needs-attention-modal">
        <div className="loading-state">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading skill gap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-needs-attention-modal">
      {isNavigating && (
        <div className="navigation-overlay">
          <div className="navigation-content">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="navigation-status">{navigationStatus}</p>
          </div>
        </div>
      )}
      <div className="progress-content">
        {studentSkillData.length > 0 ? (
          <div className="student-skill-list">
            <div className="list-header">
              <div className="header-row">
                <div className="student-col">STUDENT</div>
                <div className="skill-col">SKILL & LESSON</div>
                <div className="mastery-col">MASTERY</div>
                <div className="action-col">ACTION NEEDED</div>
              </div>
            </div>

            <div className="list-body">
              {studentSkillData.map((data, index) => (
                <div
                  key={`${data.studentId}-${data.skillId}-${index}`}
                  className="progress-row">
                  
                  <div className="student-info">
                    <UserBadge name={data.studentName} />
                    <span className="student-name">{data.studentName}</span>
                  </div>

                  <div className="skill-info">
                    <div className="skill-details">
                      <span className="skill-name">{data.skillName}</span>
                    </div>
                    <div className="lesson-details">
                      <span className="lesson-name">{data.lessonName}</span>
                    </div>
                  </div>

                  <div className="mastery-progress">
                    <StatusCard
                      status={data.currentMastery}
                      masteryStart={data.currentMastery}
                      masteryEnd={data.currentMastery}
                      observations={data.observations}
                      errors={data.errors}
                      showGraph={false}
                    />
                  </div>

                  <div className="action-needed">
                    <div 
                      className="review-lesson-link"
                      onClick={() => handleStudentClick(data.studentId)}
                    >
                      <span>Review Lesson</span>
                      <i className="icon"><Arrow /></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-progress-state">
            <div className="empty-illustration">
              <span role="img" aria-label="Assignment">📚</span>
            </div>
            <h4>No skill gaps requiring attention</h4>
            <p>All students are progressing well on their assigned skills.</p>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <p className="why-this-matters">
          <strong>Why this matters:</strong> {t('SkillGapNeedsAttention.modal_why_explanation')}
        </p>
      </div>
    </div>
  );
};

export default SkillGapNeedsAttention; 