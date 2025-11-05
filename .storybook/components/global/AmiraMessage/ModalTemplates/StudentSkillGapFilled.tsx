import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useAmiraMessage } from "../AmiraMessageContext";
import { UserBadge } from "@components/shared";
import { StatusCard } from "@components/shared";
// import { CelebrationIcon } from "../icons";
// import { selectWeeklyPlanData } from "@/store/slices";
import { MasteryPacing, SkillType } from "@enums";
import type { RootState } from "@models";
import "./StudentSkillGapFilled.scss";

interface StudentSkillProgress {
  studentId: string;
  studentName: string;
  skillId: string;
  skillName: string;
  lessonName: string;
  startOfWeekMastery: MasteryPacing;
  endOfWeekMastery: MasteryPacing;
  hasImproved: boolean;
  observations: number;
  errors: number;
}

export const StudentSkillGapFilled: React.FC = () => {
  const { t } = useTranslation("alerts");
  const { alerts, activeIndex, onDismissAllOfType, onToggleModal } =
    useAmiraMessage();
  const [studentSkillProgress, setStudentSkillProgress] = useState<
    StudentSkillProgress[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current alert and weekly plan data
  const currentAlert = alerts[activeIndex];
  // const weeklyPlanData = useSelector(selectWeeklyPlanData);
  const weeklyPlanData = {}; // Mocked for Storybook

  // Get students and classroom data from Redux store
  const roster = useSelector((state: RootState) => state.reports?.roster);
  const classroom = roster?.ui?.selections?.classroom;
  const studentsRoster = roster?.data?.student || [];

  const handleDismiss = () => {
    if (currentAlert) {
      console.log(
        "🗑️ Dismissing StudentSkillGapFilled alert via dismiss button"
      );
      onDismissAllOfType(currentAlert.type);
      onToggleModal(false);
    }
  };

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

        console.log(
          `👤 Student ${s.id} (${s.first_name} ${s.last_name}): classroom=${classroomMatch}, alertMatch=${studentIdMatch}`
        );

        return classroomMatch && studentIdMatch;
      })
      .map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        grade: s.grade,
      }));

    console.log("✅ Filtered Students:", filteredStudents);
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
        const progressData: StudentSkillProgress[] = [];

        // Extract alert data including metadata from leaId
        const skillId = (currentAlert as any).skillId;
        const lessonPlanId = (currentAlert as any).lessonPlanId;
        const pacingStarting = (currentAlert as any).pacingStarting;
        const pacingEnding = (currentAlert as any).pacingEnding;
        
        // Extract exposure and error data directly from alert object
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

                // Use alert metadata for exposure/error counts instead of weekly plan mastery records

        // Create progress entries for all students using alert data
        students.forEach(
          (student: {
            id: string;
            firstName: string;
            lastName: string;
            grade: string;
          }) => {
            // Create progress entry using alert data and metadata
            progressData.push({
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              skillId,
              skillName,
              lessonName,
              startOfWeekMastery: pacingStarting as MasteryPacing,
              endOfWeekMastery: pacingEnding as MasteryPacing,
              hasImproved: true, // From alert - this student improved
              observations: alertObservations,
              errors: alertErrors,
            });
          }
        );

        setStudentSkillProgress(progressData);
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

  if (isLoading) {
    return (
      <div className="skill-gap-filled-modal">
        <div className="loading-state">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading skill progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-filled-modal">
      <div className="progress-content">
        {studentSkillProgress.length > 0 ? (
          <div className="student-skill-list">
            <div className="list-header">
              <div className="header-row">
                <div className="student-col">STUDENT</div>
                <div className="skill-col">SKILL & LESSON</div>
                <div className="progress-col">WEEKLY PROGRESS</div>
              </div>
            </div>

            <div className="list-body">
              {studentSkillProgress.map((progress, index) => (
                <div
                  key={`${progress.studentId}-${progress.skillId}-${index}`}
                  className="progress-row">
                  <div className="student-info">
                    <UserBadge name={progress.studentName} />
                    <span className="student-name">{progress.studentName}</span>
                  </div>

                  <div className="skill-info">
                    <div className="skill-details">
                      <span className="skill-name">{progress.skillName}</span>
                    </div>
                    <div className="lesson-details">
                      <span className="lesson-name">{progress.lessonName}</span>
                    </div>
                  </div>

                  <div className="mastery-progress">
                    <StatusCard
                      status={progress.endOfWeekMastery}
                      masteryStart={progress.startOfWeekMastery}
                      masteryEnd={progress.endOfWeekMastery}
                      observations={progress.observations}
                      errors={progress.errors}
                      showGraph={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-progress-state">
            <div className="empty-illustration">
              <span role="img" aria-label="Chart">
                📊
              </span>
            </div>
            <h4>No skill improvements detected</h4>
            <p>
              This may be because the data is still being processed or no
              significant improvements were recorded this week.
            </p>
          </div>
        )}
      </div>

      <div className="modal-footer">
        <p className="why-this-matters">
          <strong>Why this matters:</strong>{" "}
          {t("StudentSkillGapFilled.modal_why_explanation")}
        </p>
        <button className="dismiss-button" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default StudentSkillGapFilled;
