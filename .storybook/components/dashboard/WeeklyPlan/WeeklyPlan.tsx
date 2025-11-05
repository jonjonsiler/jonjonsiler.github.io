import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaCalendarCheck,
} from "react-icons/fa";
import "./WeeklyPlan.scss";
import planIcon from "/images/icons/instruct-path.svg";
import { AsyncLoadingState } from "@enums";
import { Placeholder } from "@components/global";
import { ButtonThemed as Button } from "@components/shared";

export interface WeeklyPlanWidgetProps {
  loading: AsyncLoadingState;
  dateString: string;
  hasPlan: boolean;
  readyText: string;
  emptyTitleText: string;
  emptyBodyText: string;
  createText: string;
  editText: string;
  prevWeekHandler: () => void;
  nextWeekHandler: () => void;
  toPlannerHandler: () => void;
}

export const WidgetWeeklyPlan: React.FC<WeeklyPlanWidgetProps> = ({
  loading,
  dateString,
  hasPlan,
  readyText,
  emptyTitleText,
  emptyBodyText,
  createText,
  editText,
  prevWeekHandler,
  nextWeekHandler,
  toPlannerHandler,
}) => {
  return (
    <div className="widget-body widget-planner-body">
      <header>
        {/* { new Date().getTime() < startDate.getTime() &&  */}
        <FaChevronLeft
          role="button"
          name="chevron-left"
          className="widget-icon widget-prev"
          onClick={prevWeekHandler}
        />
        <h4>{dateString}</h4>
        <FaChevronRight
          role="button"
          name="chevron-right"
          className="widget-icon widget-next"
          onClick={nextWeekHandler}
        />
      </header>
      {loading !== AsyncLoadingState.SUCCESS ? (
        <div className="mb-3 w-100">
          <Placeholder colWidth={12} heightInRem={4} />
        </div>
      ) : hasPlan ? (
        <article className="alert alert-success">
          <FaCalendarCheck className="widget-icon mb-2" />
          <h5 className="alert-text mb-3">{readyText}</h5>
          <Button variant="primary" onClick={toPlannerHandler} className="mx-3">
            <img
              src={planIcon}
              className="widget-icon"
              alt={editText || "Edit your Plan"}
            />
            {editText}
          </Button>
        </article>
      ) : (
        <article className="alert alert-warning">
          <FaExclamationTriangle className="widget-icon mb-2" />
          <div className="alert-text">
            <h5 className="alert-text">{emptyTitleText}</h5>
            <p className="alert-text">
              <em>{emptyBodyText}</em>
            </p>
          </div>
          <Button variant="primary" onClick={toPlannerHandler} className="mx-3">
            <img
              src={planIcon}
              className="widget-icon"
              alt={createText || "Create a Plan"}
            />
            {createText}
          </Button>
        </article>
      )}
    </div>
  );
};