import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation, Trans as TranslateComponents } from "react-i18next";
import ReactTooltip from "react-tooltip";
import moment from "moment";
import { MasteryPacingColor } from "@enums";
import { RolloverRecommendationAction } from "./RolloverRecommendation";
import { useSkillResources } from "@hooks";
import type { Assignment } from "@models";
import { WeekDateRangeHeader } from "@components/shared";
import { Placeholder } from "@components/global";
import { type FollowUpPresentationRow, FollowUpRow } from "./_FollowUpRow";
// import { ResourceModalProvider } from "../context/ResourceModalContext";
// import RolloverModal from "@features/wizard/components/RolloverModal/RolloverModal";

import "./RolloverFollowUp.scss";

interface RolloverFollowUpProps {
  reTeachFocusSkills: any[];
  assignmentCompletePercent: number;
  studentsReadyToMoveOn: number;
  studentsNotReadyToMoveOn: number;
  studentsWithNoData: number;
  studentsCount: number;
  isLoading: boolean;
  curriculumLoadingError: string | null;
  masteryLoadingError: string | null;
  updateStudentRecommendation: (studentId: string, skillId: string, recommendation: RolloverRecommendationAction | null) => void;
  dateFrom: Date;
  weeklyPlanData: any; // Added this prop
}

export const RolloverFollowUp: React.FC<RolloverFollowUpProps> = ({
  reTeachFocusSkills,
  assignmentCompletePercent,
  studentsReadyToMoveOn,
  studentsNotReadyToMoveOn,
  studentsWithNoData,
  studentsCount,
  isLoading: reTeachLoading,
  curriculumLoadingError,
  masteryLoadingError,
  updateStudentRecommendation,
  dateFrom,
  weeklyPlanData, // Destructure weeklyPlanData
}) => {
  const { t } = useTranslation("rolloverWizard");
  const { t: toolTip } = useTranslation("student_mastery_group")

  const skillIds = useMemo(() => {
    return reTeachFocusSkills?.map(skill => skill.skillId).filter(Boolean) || [];
  }, [reTeachFocusSkills]);

  const { getResources, resourceMap } = useSkillResources();

  useEffect(() => {
    if (skillIds.length > 0) {
      getResources(skillIds, 10000);
    }
  }, [skillIds, getResources]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkillData, setSelectedSkillData] = useState<any>(null);
  const [currentSelections, setCurrentSelections] = useState<Record<string, RolloverRecommendationAction>>({});

  // Store recommendation changes in local state
  const [recommendationChanges, setRecommendationChanges] = useState<Record<string, any>>({});

  // Create lesson name lookup function
  const getLessonName = useCallback((lessonPlanId: string): string => {
    if (!weeklyPlanData?.curriculumInfo || !lessonPlanId) return '';
    
    const lessonInfo = weeklyPlanData.curriculumInfo.find(
      (lesson: any) => lesson.lessonId === lessonPlanId
    );
    
    return lessonInfo?.lessonDisplayName || lessonInfo?.lessonName || '';
  }, [weeklyPlanData]);

  const transformedFollowUpRows = useMemo(() => {
    if (!reTeachFocusSkills || reTeachFocusSkills.length === 0) {
      return [];
    }

    const rows: (FollowUpPresentationRow | null)[] = reTeachFocusSkills.map((skill: any) => {
      const lookupKey = skill.skillId || skill.displayName;
      const skillChanges = recommendationChanges[lookupKey];

      const changesMap = new Map<string, any>();

      if (skillChanges?.changes) {
        skillChanges.changes.forEach((change: any) => {
          if (change.hasChanged) {
            changesMap.set(change.studentId, change.newRecommendation);
          }
        });
      }

      const studentsWithChanges = (skill.students || []).map((student: any) => {
        const effectiveRecommendation = changesMap.has(student.studentId)
          ? changesMap.get(student.studentId)
          : student.recommendedAction;
        
        // If the recommendation changed, recalculate fulfillment
        let effectiveFulfillment = student.fulfillment;
        if (changesMap.has(student.studentId)) {
          // Recalculate fulfillment based on the new recommendation
          if (effectiveRecommendation === RolloverRecommendationAction.MoveOn) {
            effectiveFulfillment = []; // Move On = no fulfillment
          } else if (effectiveRecommendation === RolloverRecommendationAction.CompleteAssignments) {
            effectiveFulfillment = student.incompleteAssignments || [];
          } else {
            // For other recommendations, keep the original fulfillment
            // (TeacherInstruction, AddSkillTutoring, RecommendPrerequisite)
            effectiveFulfillment = student.fulfillment;
          }
        }
        
        return {
          ...student,
          recommendedAction: effectiveRecommendation,
          fulfillment: effectiveFulfillment
        };
      });

      const studentsNeedingFollowUp = studentsWithChanges.filter((student: any) =>
        student.recommendedAction !== RolloverRecommendationAction.MoveOn
      );

      // Always return the skill object, even if no students need follow-up
      return {
        skillName: skill.skillName,
        skillActivityId: skill.skillId,
        displayName: skill.displayName,
        lessonName: getLessonName(skill.lessonPlanId || ''),
        students: studentsNeedingFollowUp.map((student: any) => ({
          id: student.studentId,
          first_name: student.studentName.split(' ')[0] || '',
          last_name: student.studentName.split(' ').slice(1).join(' ') || '',
          name: student.studentName,
          grade: 2,
          completedAssignments: student.completedAssignments?.length ?? 0,
          totalAssignments: student.assignments?.length || 0,
          masteryMonday: (student.mondayMasteryStatus || 'NO_DATA') as keyof typeof MasteryPacingColor,
          masteryNow: (student.currentMasteryStatus || 'NO_DATA') as keyof typeof MasteryPacingColor,
          recommendedAction: student.recommendedAction || RolloverRecommendationAction.MoveOn,
          errorCount: student.errorCount || 0,
          exposureCount: student.exposureCount || 0,
          inference: student.inference || false,
          scenario: student.scenario,
          explanation: student.explanation,
          fulfillment: student.fulfillment as Assignment[] | undefined,
          hasValidPrerequisites: student.hasValidPrerequisites ?? true
        }))
      };
    });

    return rows
      .filter((row): row is FollowUpPresentationRow => row !== null)
      // Filter out students who don't have a fulfillment list within each row
      .map(({students, ...row})=> ({
        ...row,
        students: students.filter(({fulfillment}) => fulfillment && fulfillment.length > 0)
      }))
      // Sort by lesson order and skill sequence to match planner
      .sort((a, b) => {
        // Look up lesson info for both skills
        const lessonInfoA = weeklyPlanData?.curriculumInfo?.find(
          (lesson: any) => lesson.lessonId === reTeachFocusSkills?.find(skill => skill.skillId === a.skillActivityId)?.lessonPlanId
        );
        const lessonInfoB = weeklyPlanData?.curriculumInfo?.find(
          (lesson: any) => lesson.lessonId === reTeachFocusSkills?.find(skill => skill.skillId === b.skillActivityId)?.lessonPlanId
        );

        // Sort by lesson dateFrom first (chronological order)
        if (lessonInfoA?.lessonDateFrom && lessonInfoB?.lessonDateFrom) {
          const dateComparison = lessonInfoA.lessonDateFrom.localeCompare(lessonInfoB.lessonDateFrom);
          if (dateComparison !== 0) {
            return dateComparison;
          }
        }

        // Then sort by skill sequence within the lesson
        const skillInfoA = lessonInfoA?.skills?.find((skill: any) => skill.skillId === a.skillActivityId);
        const skillInfoB = lessonInfoB?.skills?.find((skill: any) => skill.skillId === b.skillActivityId);
        
        if (skillInfoA?.sequence && skillInfoB?.sequence) {
          const sequenceComparison = skillInfoA.sequence - skillInfoB.sequence;
          if (sequenceComparison !== 0) {
            return sequenceComparison;
          }
        }

        // Final fallback: sort by skill display name
        return a.displayName.localeCompare(b.displayName);
      });
      // Removed the final filter that excludes rows with no students - now all skills are shown
  }, [reTeachFocusSkills, recommendationChanges, getLessonName, weeklyPlanData]); // Added weeklyPlanData dependency

  // Handle modal open - pass original data + current selections separately
  const handleEditClick = (row: FollowUpPresentationRow) => {
    const originalSkill = reTeachFocusSkills?.find((skill: any) => skill.skillId === row.skillActivityId);
    if (originalSkill) {

      const lookupKey = originalSkill.skillId || originalSkill.displayName;
      const skillChanges = recommendationChanges[lookupKey];
      const currentSelections: Record<string, RolloverRecommendationAction> = {};
      const originalRecommendations: Record<string, RolloverRecommendationAction> = {};

      originalSkill.students.forEach((student: any) => {
        originalRecommendations[student.studentId] = student.originalComputedRecommendation || student.recommendedAction;
      });

      if (skillChanges?.changes) {
        skillChanges.changes.forEach((change: any) => {
          if (change.hasChanged) {
            currentSelections[change.studentId] = change.newRecommendation;
          }
        });
      }

      setSelectedSkillData({
        ...originalSkill,
        originalRecommendations,
        skillResources: Object.keys(resourceMap).map(skillId => ({
          skillId,
          resources: resourceMap[skillId] || []
        }))
      });
      setCurrentSelections(currentSelections);
      setIsModalOpen(true);
    }
  };

  const handleSaveChanges = (changes: any[]) => {
    
    const skillId = selectedSkillData?.skillId || selectedSkillData?.displayName;
    
    if (skillId) {
      // Update local state for UI
      setRecommendationChanges(prev => ({
        ...prev,
        [skillId]: {
          skillName: selectedSkillData?.skillName || selectedSkillData?.displayName,
          changes: changes,
          timestamp: new Date().toISOString()
        }
      }));
      
      changes.forEach(change => {
        if (change.hasChanged) {
          // Remove override when new recommendation matches original
          updateStudentRecommendation(
            change.studentId,
            skillId,
            change.newRecommendation === change.originalRecommendation ? null : change.newRecommendation);
        } else {
          console.log('❌ Skipping change (hasChanged is false)');
        }
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSkillData(null);
    setCurrentSelections({});
  };

  const summaryData = useMemo(() => {
    return {
      assignmentsCompleted: assignmentCompletePercent,
      readyToMoveOn: studentsReadyToMoveOn,
      needMoreTime: studentsNotReadyToMoveOn,
      noData: studentsWithNoData,
      total: studentsCount,
    };
  }, [assignmentCompletePercent, studentsReadyToMoveOn, studentsNotReadyToMoveOn, studentsWithNoData, studentsCount]);

  if (reTeachLoading) {
    return (
      <div className="rollover-followup">
        <header>
          <h2>
            <TranslateComponents
              ns="rolloverWizard"
              i18nKey="RETEACH_TITLE"
              components={{ dateRange: <WeekDateRangeHeader startingDate={dateFrom} /> }}
            />
          </h2>
        </header>
        <div className="rollover-followup-container">
          <aside className="smart-summary col-3">
            <header>
              <h4 className="text-align-left">{t("Smart Summary")}</h4>
            </header>
            <Placeholder animation="wave" heightInRem={8} colWidth={12} />
            <Placeholder animation="wave" heightInRem={8} colWidth={12} />
            <Placeholder animation="wave" heightInRem={8} colWidth={12} />
            <Placeholder animation="wave" heightInRem={8} colWidth={12} />
          </aside>
          <section className="followup-activities-table col-9">
            <div className="mb-3">
              <h3>{t("Follow-up Activities")}</h3>
            </div>
            <div className="table-responsive">
              <Placeholder animation="wave" heightInRem={12} colWidth={12} />
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Show error states if there are loading errors
  if (curriculumLoadingError || masteryLoadingError) {
    return (
      <div className="rollover-followup">
        <header>
          <h2>
            <TranslateComponents
              ns="rolloverWizard"
              i18nKey="RETEACH_TITLE"
              components={{ dateRange: <WeekDateRangeHeader startingDate={moment().subtract(1, "week").toDate()} /> }}
            />
          </h2>
        </header>
        <div className="rollover-followup-container">
          <div className="alert alert-danger">
            {curriculumLoadingError && <p>Curriculum Error: {curriculumLoadingError}</p>}
            {masteryLoadingError && <p>Mastery Error: {masteryLoadingError}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    // <ResourceModalProvider>
      <div className="rollover-followup">
        <header>
          <h2>
            <TranslateComponents
              ns="rolloverWizard"
              i18nKey="RETEACH_TITLE"
              components={{ dateRange: <WeekDateRangeHeader startingDate={moment().subtract(1, "week").toDate()} /> }}
            />
          </h2>
        </header>
        <div className="rollover-followup-container">
          {/* Smart Summary */}
          <aside className="smart-summary col-3">
            <header>
              <h4 className="text-align-left">{t("Smart Summary")}</h4>
            </header>
            <div className="smart-summary-card assignments-completed">
              <h5>{t("Assignments Completed")}</h5>
              <span>{summaryData.assignmentsCompleted}%</span>
            </div>
            <div className="smart-summary-card ready-to-move-on">
              <div 
                data-tip 
                data-for="ready-to-move-on-tooltip"
                className="smart-summary-card-content"
              >
                <h5>{t("Ready to Move On")}</h5>
                <span>{summaryData.readyToMoveOn}/{summaryData.total}</span>
              </div>
              <ReactTooltip 
                id="ready-to-move-on-tooltip" 
                place="top" 
                effect="solid"
                className="rollover-followup-tooltip"
              >
                {toolTip("tooltip_ready_to_move_on") || ""}
              </ReactTooltip>
            </div>
            <div className="smart-summary-card needs-more-time">
              <div 
                data-tip 
                data-for="needs-more-time-tooltip"
                className="smart-summary-card-content"
              >
                <h5>{t("Needs More Time")}</h5>
                <span>{summaryData.needMoreTime}/{summaryData.total}</span>
              </div>
              <ReactTooltip 
                id="needs-more-time-tooltip" 
                place="top" 
                effect="solid"
                className="rollover-followup-tooltip"
              >
                {toolTip("tooltip_needs_more_time") || ""}
              </ReactTooltip>
            </div>
            <div className="smart-summary-card insufficient-data">
              <div 
                data-tip 
                data-for="insufficient-data-tooltip"
                className="smart-summary-card-content"
              >
                <h5>{t("Insufficient Data")}</h5>
                <span>{summaryData.noData}/{summaryData.total}</span>
              </div>
              <ReactTooltip 
                id="insufficient-data-tooltip" 
                place="top" 
                effect="solid"
                className="rollover-followup-tooltip"
              >
                {toolTip("tooltip_insufficient_data") || ""}
              </ReactTooltip>
            </div>
          </aside>

          {/* Follow-up Activities Table */}
          <section className="followup-activities-table col-9">
            <div className="mb-3">
              <h3>{t("Follow-up Activities")}</h3>
            </div>
            <div>
              {/* empty state - no students needing follow-up */}
              {transformedFollowUpRows.length === 0 ? (
                <div className="alert alert-info d-flex justify-content-center align-items-center" style={{ minHeight: "10rem"}}>{t("No students needing follow-up")}</div>
              ) : (

              /* table - students needing follow-up */
              <table className="table table-borderless">
                <thead>
                  <tr>
                    <th style={{ minWidth: 320 }}>{t("Skills from Last Week")}</th>
                    <th style={{ minWidth: 220 }}>{t("Needs More Time")}</th>
                    <th style={{ minWidth: 260 }}>{t("To Be Added to Plan")}</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                {/* Footer is purely for presentation purposes */}
                <tfoot><tr><td colSpan={4}></td></tr></tfoot>
                <tbody>
                  {transformedFollowUpRows.map((row, idx) => (
                    <FollowUpRow 
                      key={`${row.skillActivityId}-${idx}`} 
                      row={row} 
                      onEditClick={() => handleEditClick(row)}
                    />
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </section>
        </div>

        {/* Modal with the new callback */}
        {/* <RolloverModal
          data={selectedSkillData}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSaveChanges={handleSaveChanges}
          currentSelections={currentSelections}
          originalRecommendations={selectedSkillData?.originalRecommendations}
          hasValidPrerequisites={selectedSkillData?.hasValidPrerequisites}
          hasTutoringResources={selectedSkillData?.hasTutoringResources}
        /> */}
      </div>
    // </ResourceModalProvider>
  );
};