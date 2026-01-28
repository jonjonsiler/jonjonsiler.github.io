import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Assignment, Student } from "@models";
import { MasteryPacingColor } from "@enums";
// import { RolloverRecommendationAction } from "@/features/planner/enums";
import { BadgeWithTooltip } from "@components/features/wizard";
import {
  RolloverIcon,
  SkilltreeIcon,
  TeacherInstructionIcon,
  TutorIcon,
  EditIcon,
} from "@components/global/icons";

interface FollowUpRowProps {
  row: FollowUpPresentationRow;
  onEditClick: () => void;
}

export enum RolloverRecommendationAction {
  MoveOn = 'Move On',
  AddSkillTutoring = 'Add skill tutoring',
  RecommendPrerequisite = 'Recommend Prerequisite skill for this student',
  TeacherInstruction = 'Teacher instruction',
  CompleteAssignments = 'Complete assignments',
  NoAction = 'No action',
}

export interface FollowUpStudentRec extends Student {
  name: string;
  completedAssignments: number;
  totalAssignments: number;
  masteryNow: keyof typeof MasteryPacingColor;
  recommendedAction: RolloverRecommendationAction;
  scenario?: string;
  explanation?: string;
  errorCount: number;
  exposureCount: number;
  inference: boolean;
  fulfillment?: Assignment[];
  masteryMonday?: keyof typeof MasteryPacingColor;
}

export interface FollowUpPresentationRow {
  skillName: string;
  skillActivityId: string;
  displayName: string;
  lessonName?: string;
  students: FollowUpStudentRec[];
}

const recommendationIcon: Partial<
  Record<RolloverRecommendationAction, React.ReactNode>
> = {
  [RolloverRecommendationAction.CompleteAssignments]: (
    <i className="icon">
      <RolloverIcon />
    </i>
  ),
  [RolloverRecommendationAction.AddSkillTutoring]: (
    <i className="icon">
      <TutorIcon />
    </i>
  ),
  [RolloverRecommendationAction.RecommendPrerequisite]: (
    <i className="icon">
      <SkilltreeIcon />
    </i>
  ),
  [RolloverRecommendationAction.TeacherInstruction]: (
    <i className="icon">
      <TeacherInstructionIcon />
    </i>
  ),
};

const recommendationLabel: Partial<
  Record<RolloverRecommendationAction, string>
> = {
  [RolloverRecommendationAction.CompleteAssignments]: "INCOMPLETE",
  [RolloverRecommendationAction.AddSkillTutoring]: "TUTOR",
  [RolloverRecommendationAction.RecommendPrerequisite]: "PREREQ",
  [RolloverRecommendationAction.TeacherInstruction]: "TEACHER",
};

// Caret down icon component
const CaretDownIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ 
      width: 16, 
      height: 16, 
      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease'
    }}
  >
    <path 
      d="M12.9574 5.48286L8.42518 10.7471C8.36381 10.8208 8.28903 10.8809 8.20514 10.9241C8.12124 10.9673 8.02999 10.9926 7.93662 10.9986C7.84324 11.0046 7.74965 10.9912 7.66131 10.959C7.57298 10.9269 7.49162 10.8768 7.42205 10.8115L7.34494 10.731L3.03389 5.26285C2.92071 5.12332 3.11628 4.91405 3.25003 5.03747L8.44578 9.59876H7.36553L12.6641 5.18236C12.7065 5.15293 12.7575 5.14003 12.8081 5.14595C12.8586 5.15187 12.9055 5.17622 12.9406 5.2147C12.9756 5.25318 12.9965 5.30334 12.9996 5.35632C13.0027 5.40931 12.9877 5.46172 12.9574 5.50433V5.48286Z" 
      fill="currentColor"
    />
  </svg>
);

const ToggleRow: React.FC<{
  showAllAtGradeLevel: boolean,
  setShowAllAtGradeLevel: (showAllAtGradeLevel: boolean) => void,
  hiddenAtGradeLevelCount: number
}> = ({
  showAllAtGradeLevel,
  setShowAllAtGradeLevel,
  hiddenAtGradeLevelCount,
}) => { 
  const { t } = useTranslation("rolloverWizard");
  return (
    <tr key="expand-toggle">
      <td 
        colSpan={2} 
        className="text-center py-2"
      >
        <button
          type="button"
          className="btn btn-link p-0 d-flex align-items-center justify-content-center gap-1 text-muted"
          style={{ fontSize: '0.75rem' }}
          onClick={() => setShowAllAtGradeLevel(!showAllAtGradeLevel)}
        >
          <CaretDownIcon isExpanded={showAllAtGradeLevel} />
          {showAllAtGradeLevel 
            ? t('SHOW_LESS') 
            : t('SHOW_MORE_AT_GRADE_LEVEL', { count: hiddenAtGradeLevelCount })
          }
        </button>
      </td>
    </tr>
    )
};

export const FollowUpRow: React.FC<FollowUpRowProps> = ({
  row,
  onEditClick,
}) => {
  const { t } = useTranslation("rolloverWizard");
  const [showAllAtGradeLevel, setShowAllAtGradeLevel] = useState(false);

  const recommendationCount = ({ fulfillment, recommendedAction }: FollowUpStudentRec) => {
    if (!fulfillment) return 0;
    
    // Only filter out teacherResource types for CompleteAssignments (Incomplete Assignments)
    if (recommendedAction === RolloverRecommendationAction.CompleteAssignments) {
      return fulfillment.filter((item: any) => item.resourceType !== 'teacherResource').length;
    }
    
    // For prerequisite skills, always return 1 since each prerequisite skill is counted as one unit
    if (recommendedAction === RolloverRecommendationAction.RecommendPrerequisite) {
      return 1;
    }
    
    // For other recommendation types, return full count
    return fulfillment.length;
  };

  // Group students by mastery level
  const groupedStudents = React.useMemo(() => {
    const groups = {
      belowGradeLevel: [] as FollowUpStudentRec[],
      atGradeLevel: [] as FollowUpStudentRec[],
      aboveGradeLevel: [] as FollowUpStudentRec[],
      noData: [] as FollowUpStudentRec[]
    };

    row.students.forEach(student => {
      const masteryLevel = student.masteryNow;
      
      switch (masteryLevel) {
        case 'BELOW_GRADE_LEVEL':
          groups.belowGradeLevel.push(student);
          break;
        case 'AT_GRADE_LEVEL':
          groups.atGradeLevel.push(student);
          break;
        case 'AHEAD_OF_GRADE_LEVEL':
          groups.aboveGradeLevel.push(student);
          break;
        default:
          groups.noData.push(student);
          break;
      }
    });

    return groups;
  }, [row.students]);

  // Create display list based on grouping and expand state
  const displayStudents = React.useMemo(() => {
    const { belowGradeLevel, atGradeLevel, aboveGradeLevel, noData } = groupedStudents;
    
    let studentsToShow = [
      ...belowGradeLevel,
      ...aboveGradeLevel,
      ...noData
    ];

    // Handle at-grade-level students
    if (atGradeLevel.length > 5 && !showAllAtGradeLevel) {
      studentsToShow.push(...atGradeLevel.slice(0, 5));
    } else {
      studentsToShow.push(...atGradeLevel);
    }

    return studentsToShow;
  }, [groupedStudents, showAllAtGradeLevel]);

  const hasCollapsibleAtGradeLevel = groupedStudents.atGradeLevel.length > 5;
  const hiddenAtGradeLevelCount = hasCollapsibleAtGradeLevel && !showAllAtGradeLevel 
    ? groupedStudents.atGradeLevel.length - 5 
    : 0;

  // If no students need follow-up, render a placeholder row
  if (row.students.length === 0) {
    return (
      <tr>
        <td className="" rowSpan={1}>
          <div>
            {row.displayName}
            {row.lessonName && (
              <div className="text-muted fst-italic small">
                {row.lessonName}
              </div>
            )}
          </div>
        </td>
        <td>
          <span className="text-muted">—</span>
        </td>
        <td>
          <span className="text-muted">—</span>
        </td>
        <td rowSpan={1}>
          <button 
            className="btn btn-link" 
            style={{ background: "none" }}
            onClick={(e) => {
              e.stopPropagation();
              onEditClick?.();
            }}
          >
            <EditIcon color="currentColor"/>
          </button>
        </td>
      </tr>
    );
  }

  const totalRowSpan = displayStudents.length + (hasCollapsibleAtGradeLevel ? 1 : 0);

  const renderStudentRow = (s: FollowUpStudentRec, idx: number) => {
    const firstName = (s as any).first_name;
    const lastName = (s as any).last_name;
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : s.name;

    return (
      <tr key={s.id}>
        {
          /* Only render skillName cell for the first student */
          idx === 0 && (
            <td className="" rowSpan={totalRowSpan}>
              <div>
                {row.displayName}
                {row.lessonName && (
                  <div className="text-muted fst-italic small">
                    {row.lessonName}
                  </div>
                )}
              </div>
            </td>
          )
        }
        <td className="rollover-student-list">
          <BadgeWithTooltip
            fullName={fullName}
            firstName={firstName}
            displayName={row.skillName}
            errorCount={s.errorCount}
            exposureCount={s.exposureCount}
            masteryNow={s.masteryNow}
            inference={s.inference}
            showIcon={false}
            template={"TIME_NEEDED"}
          />
        </td>
        <td>
          {/* Recommendation Icon & Label */}
          <span className="d-inline-flex justify-content-start align-items-start gap-1">
            {recommendationIcon[s.recommendedAction] ?? <span>✅</span>}
            <span>
              {t(recommendationLabel[s.recommendedAction] ?? "", {
                count: recommendationCount(s),
              })}
            </span>
          </span>
        </td>
        {
          /* Edit Button */
          /* Only render edit button cell for the first student */
          idx === 0 && (
            <td rowSpan={totalRowSpan}>
              <button 
                className="btn btn-link" 
                style={{ background: "none" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick?.();
                }}
              >
                <EditIcon color="currentColor"/>
              </button>
            </td>
          )
        }
      </tr>
    );
  };

  return (
    <>
      {displayStudents.map((s, idx) => renderStudentRow(s, idx))}
      {hasCollapsibleAtGradeLevel && (
      <ToggleRow
        showAllAtGradeLevel={showAllAtGradeLevel}
        setShowAllAtGradeLevel={setShowAllAtGradeLevel}
        hiddenAtGradeLevelCount={hiddenAtGradeLevelCount}
      />
      )}
    </>
  );
};
