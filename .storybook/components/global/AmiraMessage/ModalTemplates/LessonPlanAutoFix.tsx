import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AsyncLoadingState, AlertType } from "@enums";
import type { LessonDetails, RootState } from "@models";
import { useAmiraMessage } from "../AmiraMessageContext";
import { makeToast, ToastTypes } from "@components/global";
import { handleBothOverAndUnderbooked } from "./LessonPlanAutoFixUtils";
import "./LessonPlanAutoFix.scss";
// import { updateAssignmentMutationLoadingState } from "@/store/slices";

type OverbookedHandler = (
  studentIds: string[],
  lesson: LessonDetails,
  dispatch: any,
  skills: any[],
  skillsOrder: string[]
) => Promise<Map<string, any[]>>;

type UnderbookedHandler = (
  studentIds: string[],
  lesson: LessonDetails,
  dispatch: any,
  skills: any[],
  skillsOrder: string[],
  existingManifests?: Map<string, any[]>
) => Promise<number>;

interface LessonPlanAutoFixProps {
  getLessonData: () => {
    lesson: LessonDetails;
    skills: any[];
    overbookedStudentIds: string[];
    underbookedStudentIds: string[];
    skillsOrder: string[];
  };
  handleOverbookedStudents: OverbookedHandler;
  handleUnderbookedStudents: UnderbookedHandler;
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

const createToastMessage = (
  overbookedCount: number,
  underbookedCount: number
): string | null => {
  const messages: string[] = [];

  if (overbookedCount > 0) {
    messages.push(
      `${pluralize(overbookedCount, "overbooked student")} adjusted`
    );
  }

  if (underbookedCount > 0) {
    messages.push(
      `${pluralize(underbookedCount, "underbooked student")} adjusted`
    );
  }

  return messages.length > 0 ? messages.join(", ") : null;
};

export const LessonPlanAutoFix: React.FC<LessonPlanAutoFixProps> = ({
  getLessonData,
  handleOverbookedStudents,
  handleUnderbookedStudents,
}) => {
  const dispatch = useDispatch();
  const { onToggleModal, onDismiss, alerts, onDismissAllOfType } = useAmiraMessage();
  const { t } = useTranslation("alerts");
  const { mutateAssignmentsLoading } = useSelector((state: RootState) => state.weeklyPlan);
  
  // Add refs for tracking state changes and preventing initial mount toasts
  const mutateAssignmentsLoadingRef = useRef(mutateAssignmentsLoading);
  const isInitialMount = useRef(true);
  const overbookedCountRef = useRef(0);
  const underbookedCountRef = useRef(0);

  // Reset loading state when modal opens to prevent immediate toast notifications
  // useEffect(() => {
  //   if (mutateAssignmentsLoading === AsyncLoadingState.SUCCESS) {
  //     dispatch(updateAssignmentMutationLoadingState(AsyncLoadingState.NONE));
  //   }
  //   mutateAssignmentsLoadingRef.current = mutateAssignmentsLoading;
  //   isInitialMount.current = false;
  // }, []); // Empty dependency array - runs only once when component mounts

  // Handle API completion with toast notifications
  useEffect(() => {
    // Don't trigger toast/close on initial mount - only on legitimate state changes
    if (!isInitialMount.current && mutateAssignmentsLoading === AsyncLoadingState.SUCCESS && mutateAssignmentsLoadingRef.current !== AsyncLoadingState.SUCCESS) {
      mutateAssignmentsLoadingRef.current = mutateAssignmentsLoading;
      
      const toastMessage = createToastMessage(overbookedCountRef.current, underbookedCountRef.current);

      if (toastMessage) {
        makeToast(toastMessage, ToastTypes.success, true, 5000);
      }

      onToggleModal(false);

      const { lesson } = getLessonData();
      const alertForThisLesson = alerts.find((alert) =>
        alert.alertIds.includes(`${lesson.lessonPlanId}_AUTO_FIX`)
      );

      if (alertForThisLesson) {
        onDismiss(alertForThisLesson.id);
      }

      dispatch(updateAssignmentMutationLoadingState(AsyncLoadingState.NONE));
    } else if (mutateAssignmentsLoading === AsyncLoadingState.ERROR) {
      makeToast('Error updating lesson plan', ToastTypes.warning, true, 5000);
      dispatch(updateAssignmentMutationLoadingState(AsyncLoadingState.NONE));
    }
    // Update ref after processing to track state changes
    if (!isInitialMount.current) {
      mutateAssignmentsLoadingRef.current = mutateAssignmentsLoading;
    }
  }, [mutateAssignmentsLoading, dispatch, onToggleModal, onDismiss, alerts, getLessonData]);

  const handleConfirm = useCallback(async () => {
    // Get fresh data right before making changes
    const {
      lesson,
      skills,
      overbookedStudentIds: currentOverbooked,
      underbookedStudentIds: currentUnderbooked,
      skillsOrder,
    } = getLessonData();

    let overbookedCount = 0;
    let underbookedCount = 0;

    if (currentOverbooked.length > 0 && currentUnderbooked.length > 0) {
      console.log("handleBothOverAndUnderbooked");
      const result = await handleBothOverAndUnderbooked(
        currentOverbooked,
        currentUnderbooked,
        lesson,
        dispatch,
        skills,
        skillsOrder
      );
      overbookedCount = result.overbookedCount;
      underbookedCount = result.underbookedCount;
    } else if (currentOverbooked.length > 0) {
      console.log("handleOverbookedStudents");
      await handleOverbookedStudents(
        currentOverbooked,
        lesson,
        dispatch,
        skills,
        skillsOrder
      );
      overbookedCount = currentOverbooked.length;
    } else if (currentUnderbooked.length > 0) {
      console.log("handleUnderbookedStudents");
      await handleUnderbookedStudents(
        currentUnderbooked,
        lesson,
        dispatch,
        skills,
        skillsOrder
      );
      underbookedCount = currentUnderbooked.length;
    }

    // Store counts in refs for use in useEffect
    overbookedCountRef.current = overbookedCount;
    underbookedCountRef.current = underbookedCount;

    // The useEffect will handle the toast notification and modal closing when the API completes
  }, [getLessonData, dispatch, handleOverbookedStudents, handleUnderbookedStudents]);

  const handleCancel = () => {
    onDismissAllOfType(AlertType.LessonPlanAutoFix);
    onToggleModal(false);
  };

  const {
    overbookedStudentIds: currentOverbooked,
    underbookedStudentIds: currentUnderbooked,
  } = getLessonData();

  const totalStudents = [
    ...new Set([...currentOverbooked, ...currentUnderbooked]),
  ].length;

  return (
    <div className="lesson-plan-auto-fix">
      <p className="lesson-plan-auto-fix__description">
        {totalStudents === 1
          ? t("LessonPlanAutoFix.modal_description", {
              count: totalStudents,
            })
          : t("LessonPlanAutoFix.modal_description_grouped", {
              count: totalStudents,
            })}
      </p>

      <div className="lesson-plan-auto-fix__actions">
        <button
          className="lesson-plan-auto-fix__action-button"
          onClick={handleCancel}
          disabled={mutateAssignmentsLoading === AsyncLoadingState.LOADING}
        >
          {t("LessonPlanAutoFix.cancel")}
        </button>
        <button
          className="lesson-plan-auto-fix__action-button"
          onClick={handleConfirm}
          disabled={mutateAssignmentsLoading === AsyncLoadingState.LOADING}
        >
          {mutateAssignmentsLoading === AsyncLoadingState.LOADING 
            ? t("LessonPlanAutoFix.processing", "Processing...") 
            : t("LessonPlanAutoFix.confirm")}
        </button>
      </div>
    </div>
  );
};
