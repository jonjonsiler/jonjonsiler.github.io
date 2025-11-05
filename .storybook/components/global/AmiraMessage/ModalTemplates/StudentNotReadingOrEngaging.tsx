import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserBadge } from "@components/shared";
import { Arrow } from "@components/global/icons";
// import ResourceGuide from "@components/Teacher/ResourceGuide";
// import rosterCreators from "@components/Reports/state/roster/creators";
import type { RootState } from "@models";
import "./StudentNotReadingOrEngaging.scss";

export const StudentNotReadingOrEngaging: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { onToggleModal, onRemoveStudentFromAlert, alerts, activeIndex } = useAmiraMessage();
  const onToggleModal = () => {};
  const onRemoveStudentFromAlert = () => {};
  const alerts: any[] = [];
  const activeIndex = 0;
  const { t } = useTranslation("alerts");
  
  // Get the current alert and its specific student IDs
  const currentAlert = alerts[activeIndex];
  const alertStudentIds = currentAlert?.studentIds || [];
  
  // Get students from Redux store
  const roster = useSelector((state: RootState) => state.reports?.roster);
  const classroom = roster?.ui?.selections?.classroom;
  const studentsRoster = roster?.data?.student || [];

  // Filter students to only include those in the current alert
  // Handle potential data type mismatches (string vs number)
  const students = studentsRoster
    .filter((s: any) => {
      const classroomMatch = s.classroom_id.includes(`${classroom?.id}`);
      const studentIdMatch = alertStudentIds.includes(s.id) || 
                           alertStudentIds.includes(parseInt(s.id)) || 
                           alertStudentIds.includes(s.id.toString());
      
      console.log(`Student ${s.id} (${s.first_name} ${s.last_name}): classroom=${classroomMatch}, alertMatch=${studentIdMatch}`);
      
      return classroomMatch && studentIdMatch;
    })
    .map((s: any) => ({
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      grade: s.grade,
    }));
    
  // Fallback: if no students found from alert, show all students in classroom (for debugging)
  const finalStudents = students.length > 0 ? students : studentsRoster
    .filter((s: any) => s.classroom_id.includes(`${classroom?.id}`))
    .map((s: any) => ({
      id: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      grade: s.grade,
    }));

  const onProgressReportClick = (studentId: string) => {
    const student = finalStudents.find((s: any) => s.id === studentId);

    if (!student) return;

    // dispatch(
    //   rosterCreators.rosterSelect({
    //     type: "student",
    //     data: {
    //       id: student.id,
    //       value: student.id,
    //       label: `${student.firstName} ${student.lastName}`,
    //       first_name: student.firstName,
    //       last_name: student.lastName,
    //       grade: student.grade,
    //     },
    //   }) as any
    // );

    // dispatch({
    //   type: "SET_TEACHER_SELECT_STATE",
    //   payload: {
    //     selections: {
    //       metric: {
    //         label: "Overall Reading: ARM Score",
    //         value: "ARM",
    //       },
    //       scale: { value: "ARM", label: "ARM Scale" },
    //       benchmark: {
    //         value: `NationalNorms_0`,
    //         label: `National Norms - ${student.grade}`,
    //         grade: student.grade,
    //       },
    //     },
    //   },
    // });

    navigate("/teacher/reports/type/progress");
    // onToggleModal(false);
    
    // Remove only the specific student from the alert
    // if (currentAlert) {
    //   onRemoveStudentFromAlert(currentAlert.id, parseInt(studentId));
    // }
    
    // Mark that user has interacted with alerts to prevent auto-opening
    sessionStorage.setItem('amira-alerts-user-interacted', 'true');
  };

  return (
    <div className="student-not-reading-modal">
      <p className="student-not-reading-modal__description">
        {t("StudentNotReadingOrEngaging.modal_description")}
      </p>

      <div className="student-not-reading-modal__students-container">
        {finalStudents.map((student: any) => (
          <div
            key={student.id}
            className="student-not-reading-modal__student-row"
          >
            <div className="student-not-reading-modal__student-badge">
              <UserBadge name={`${student.firstName} ${student.lastName}`} />
              {student.firstName} {student.lastName}
            </div>

            <span
              className="student-not-reading-modal__progress-link"
              onClick={() => onProgressReportClick(student.id)}
            >
              {t("StudentNotReadingOrEngaging.review_progress_report")}
              <div className="student-not-reading-modal__arrow-icon">
                <Arrow />
              </div>
            </span>
          </div>
        ))}

      </div>

      {/* <ResourceGuide /> */}
      <div className="student-not-reading-modal__actions">
        <button className="student-not-reading-modal__action-button">
          {t("StudentNotReadingOrEngaging.dismiss")}
        </button>
        <button className="student-not-reading-modal__action-button">
          {t("StudentNotReadingOrEngaging.snooze")}
        </button>
      </div>
    </div>
  );
};

export default StudentNotReadingOrEngaging;
