import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { MasteryStatus } from '@enums';

import './MiniLessonCard.scss';
import { Calendar } from '@components/global/icons';
import CheckmarkIcon from '/images/icons/checkmark-outline.svg';


export interface MiniLessonCardProps {
  date: Date;
  lessonName: string;
  percentComplete: number | null;
  unitName: string;
  mastery: MasteryStatus;
}

export const MiniLessonCard: React.FC<MiniLessonCardProps> = ({
  date,
  lessonName,
  percentComplete,
  unitName,
  mastery
}) => {
  const { t, i18n } = useTranslation('dashboard');

  const [percent, setPercent] = useState(0);
  const [masteryClasses, setMasteryClasses] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setPercent(percentComplete ?? 0);
    }, 300);

    setTimeout(() => {
      let name = 'percent-anim-done ';

      switch(mastery) {
        case MasteryStatus.NOT_DEVELOPED:
          name += 'incipient';
          break;
        case MasteryStatus.DEVELOPING:
          name += 'developing';
          break;
        case MasteryStatus.LIKELY_MASTERED:
          name += 'mastered';
          break;
        default:
          name += 'no-data';
          break; 
      }
      setMasteryClasses(name);
    }, 1000);
  }, [mastery]);

  const getAnimationName = () => {
    let animationName = 'percent-fill-bar-';
    if (percent < 50) {
      animationName += 'incipient';
    } else if (percent < 80) {
      animationName += 'developing';
    } else {
      animationName += 'mastered';
    }
    return animationName;
  };
  
  const isSameDay = () => moment(date).startOf('day').isSame(moment(), 'day');
  
  const getFormattedDate = () => {
    if (isSameDay()) {
      return <strong>{t('TODAY')}</strong>;
    }

    const d = moment(date).locale(i18n.language).startOf('day');
    return (
      <>
        <Calendar  alt={`${t('CALENDAR')}`} className='calendar-icon'/>
        {d.format('ddd MM/DD')}
      </>
    );
  };

  return (
    <div
      className={`mini-lesson-card-wrapper ${masteryClasses} ${isSameDay() ? 'same-day' : ''}`}
      aria-label={
        isSameDay()
          ? t('LESSON_CARD_TODAY_ARIA') || ''
          : t('LESSON_CARD_ARIA') || ''
      }
      role="region">
      <div className="mini-lesson-card-container d-flex flex-column">
        <div
          className="header d-flex justify-content-center text-nowrap"
          aria-label={t('DATE_ARIA') || ''}>
          {getFormattedDate()}
        </div>
        <div className="body h-100 d-flex flex-column justify-content-between align-items-center">
          <div
            className="unit-name"
            title={unitName}
            aria-label={t('UNIT_NAME_ARIA') || ''}>
            {unitName === 'Rollover & Prerequisites' 
              ? t("ROLLOVER_PREREQUISITES", { ns: "dashboard" }) || unitName
              : unitName
            }
          </div>
          <div
            className="lesson-name"
            title={lessonName}
            aria-label={t('LESSON_NAME_ARIA') || ''}>
            {lessonName === 'Rollover & Prerequisites' 
              ? t("ROLLOVER_PREREQUISITES", { ns: "dashboard" }) || lessonName
              : lessonName
            }
          </div>
          <div className="percent-complete">
            {percentComplete ? (
    
          <div
            className="percent-complete-text d-flex justify-content-between align-items-baseline"
            aria-label={t('PERCENT_COMPLETE_ARIA') || '' + ' ' + percent}>
          
            <span className={percent === 100 ? 'complete-text' : ''}>
              {percent === 100 ? t('COMPLETE') : t('IN_PROGRESS')}
            </span>
            {percent === 100 ? (
              <img src={CheckmarkIcon} alt="100%" />
            ) : (
              <span style={{ '--percent-value': percent } as React.CSSProperties}></span>
            )}
          </div> 
            ) : (
              <div
                className="not-started"
                aria-label={t('NOT_STARTED_ARIA') || ''}>
                {t('NOT_STARTED')}
              </div>
            )}
            <div className="percent-complete-bar" aria-hidden="true">
              <div
                className="percent-complete-bar-fill"
                style={{
                  width: percent + '%',
                  animationName: getAnimationName(),
                }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniLessonCard;
