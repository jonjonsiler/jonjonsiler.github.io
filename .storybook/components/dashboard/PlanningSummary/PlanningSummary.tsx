import React from "react";
import { useTranslation } from "react-i18next";

import "./PlanningSummary.scss";
import { Placeholder } from "@components/global";

export interface PlanningSummaryProps {
  studentsStruggling: number;
  studentsShowedGrowth: number;
  studentsNotReady: number;
  skillsToBeTaught: number;
  studentsUnderbooked: number;
  isLoading: boolean;
}

export const PlanningSummary: React.FC<PlanningSummaryProps> = ({
  studentsStruggling,
  studentsShowedGrowth,
  studentsNotReady,
  skillsToBeTaught,
  studentsUnderbooked,
  isLoading
}) => {
  if (
    studentsStruggling === 0 
    && studentsShowedGrowth === 0 
    && skillsToBeTaught === 0 
    && studentsNotReady === 0 
    && studentsUnderbooked === 0
  ) return null;
  const { t } = useTranslation('planner');
  return <article className="planning-summary px-5 pt-5 pb-4">
    <header>
      <h4>{t('SUMMARY_HEADER')}</h4>
    </header>
    <div className="d-flex gap-5">
      {isLoading && (
      <>
        <div className="col">
          <header>
            <h5>{t('TAKE_ACTION_HEADER')}</h5>
          </header>
          <ul>
            <li><Placeholder colWidth={8} heightInRem={1} /></li>
            <li><Placeholder colWidth={8} heightInRem={1} /></li>
          </ul>
        </div>
        <div className="col">
          <header>
            <h5>{t('TO_DO_HEADER')}</h5>
          </header>
          <ul>
            <li><Placeholder colWidth={8} heightInRem={1} /></li>
            <li><Placeholder colWidth={8} heightInRem={1} /></li>
          </ul>
        </div>
      </>
      )} 
      {
        !isLoading 
        &&(
          studentsStruggling > 0 
          || studentsShowedGrowth > 0
        ) 
        && (
      <div className="col">
        <header>
          <h5>{t('TAKE_ACTION_HEADER')}</h5>
        </header>
        <ul>
        { studentsStruggling > 0 && (
          <li className="planning-summary-item struggling">{t('STUDENTS_STRUGGLING', {count: studentsStruggling})}</li>
        )}
        { studentsShowedGrowth > 0 && (
          <li className="planning-summary-item growth">{t('STUDENTS_SHOWED_GROWTH', {count: studentsShowedGrowth})}</li>
        )}
        </ul>
      </div>
      )}
      {
        !isLoading && (
          skillsToBeTaught > 0 
          || studentsNotReady > 0 
          || studentsUnderbooked > 0
        ) && (
      <div className="col">
        <header>
          <h5>{t('TO_DO_HEADER')}</h5>
        </header>
        <ul>
          { skillsToBeTaught > 0 && (
            <li className="planning-summary-item skills">{t('SKILLS_TO_BE_TAUGHT', {count: skillsToBeTaught})}</li>
          )}
          { studentsNotReady > 0 && (
            <li className="planning-summary-item not-ready">{t('STUDENTS_NOT_READY', {count: studentsNotReady})}</li>
          )}
          { (skillsToBeTaught === 0 || studentsNotReady === 0) && studentsUnderbooked > 0 && (
            <li className="planning-summary-item underbooked">{t('STUDENTS_UNDERBOOKED', {count: studentsUnderbooked})}</li>
          )}
        </ul>
      </div>
      )}
    </div>
</article>;
};