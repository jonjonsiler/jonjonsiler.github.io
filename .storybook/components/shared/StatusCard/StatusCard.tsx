import React from 'react'
import { useTranslation } from 'react-i18next'
import { MasteryStatusPacing, MasteryStatus, MasteryPacing, MasteryChange } from '@enums'
import './StatusCard.scss'
import { MasteryChangeIndicator } from '@components/shared';

// Import all SVG files
import noDataGraph from '/images/mastery-change/NoDataGraphs/noDataGraph.svg';

// NotDeveloped (red) graphs
import redNoDataNotDeveloped from '/images/mastery-change/NotDevelopedGraphs/red-noData-notDeveloped.svg';
import redNotDevelopedNotDeveloped from '/images/mastery-change/NotDevelopedGraphs/red-notDeveloped-notDeveloped.svg';
import redDevelopingNotDeveloped from '/images/mastery-change/NotDevelopedGraphs/red-devloping-notDeveloped.svg';
import redLikelyMasteredNotDeveloped from '/images/mastery-change/NotDevelopedGraphs/red-likleyMastered-notDeveloped.svg';

// Developing (yellow) graphs
import yellowNotDevelopedDeveloping from '/images/mastery-change/DevelopingGraphs/yellow-notDeveloped-developing.svg';
import yellowDevelopingDeveloping from '/images/mastery-change/DevelopingGraphs/yellow-developing-developing.svg';
import yellowLikelyMasteredDeveloping from '/images/mastery-change/DevelopingGraphs/yellow-likelyMastered-developing.svg';
import yellowNoDataDeveloping from '/images/mastery-change/DevelopingGraphs/yellow-noData-developing.svg';

// LikelyMastered (green) graphs
import greenDevelopingLikelyMastered from '/images/mastery-change/LikelyMasteredGraphs/green-developing-likelyMastered.svg';
import greenLikelyMasteredLikelyMastered from '/images/mastery-change/LikelyMasteredGraphs/green-likelyMastered-likelyMastered.svg';
import greenNoDataLikelyMastered from '/images/mastery-change/LikelyMasteredGraphs/green-noData-likelyMastered.svg';
import greenNotDevelopedLikelyMastered from '/images/mastery-change/LikelyMasteredGraphs/green-notDeveloped-likelyMastered.svg';

// Create mapping object for imported images
const masteryChangeGraphs = {
  noData: noDataGraph,
  'red-noData-notDeveloped': redNoDataNotDeveloped,
  'red-notDeveloped-notDeveloped': redNotDevelopedNotDeveloped,
  'red-devloping-notDeveloped': redDevelopingNotDeveloped,
  'red-likleyMastered-notDeveloped': redLikelyMasteredNotDeveloped,
  'yellow-notDeveloped-developing': yellowNotDevelopedDeveloping,
  'yellow-developing-developing': yellowDevelopingDeveloping,
  'yellow-likelyMastered-developing': yellowLikelyMasteredDeveloping,
  'yellow-noData-developing': yellowNoDataDeveloping,
  'green-developing-likelyMastered': greenDevelopingLikelyMastered,
  'green-likelyMastered-likelyMastered': greenLikelyMasteredLikelyMastered,
  'green-noData-likelyMastered': greenNoDataLikelyMastered,
  'green-notDeveloped-likelyMastered': greenNotDevelopedLikelyMastered,
};

interface StatusCardProps {
  status: MasteryPacing;
  masteryStart: MasteryPacing;
  masteryEnd: MasteryPacing;
  observations: number;
  errors: number;
  showGraph?: boolean;
  preReqModal?: boolean;
  inference?: boolean;
  mini?: boolean;
  studentName?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status = MasteryStatusPacing.NOT_DEVELOPED,
  masteryStart,
  masteryEnd,
  observations,
  errors,
  showGraph,
  preReqModal,
  inference,
  mini,
  studentName
}) => {
  const { t: tStandardsMasteryReport } = useTranslation('standards_mastery_report');
  const { t: tStudentMasteryGroup } = useTranslation('student_mastery_group');
  const { t: tCommon } = useTranslation();
  const { t: tSkillsStatusReport } = useTranslation(['skills_status_report']);

  const statusMapping = {
    [MasteryPacing.BELOW_GRADE_LEVEL]: MasteryStatus.NOT_DEVELOPED,
    [MasteryPacing.AT_GRADE_LEVEL]: MasteryStatus.DEVELOPING,
    [MasteryPacing.AHEAD_OF_GRADE_LEVEL]: MasteryStatus.LIKELY_MASTERED,
    [MasteryPacing.NO_DATA]: MasteryStatus.NO_DATA,
  };

  const getMasteryChangeGraphPath = () => {
    if (masteryStart === MasteryPacing.NO_DATA && masteryEnd === MasteryPacing.NO_DATA) {
      return masteryChangeGraphs.noData;
    }

    if (!masteryStart || !masteryEnd) {
      return null;
    }

    const pacingToStatusName = {
      [MasteryPacing.BELOW_GRADE_LEVEL]: 'notDeveloped',
      [MasteryPacing.AT_GRADE_LEVEL]: 'developing',
      [MasteryPacing.AHEAD_OF_GRADE_LEVEL]: 'likelyMastered',
      [MasteryPacing.NO_DATA]: 'noData',
    };

    const startStatus = pacingToStatusName[masteryStart];
    const endStatus = pacingToStatusName[masteryEnd];

    let color = '';

    switch (masteryEnd) {
      case MasteryPacing.AHEAD_OF_GRADE_LEVEL:
        color = 'green';
        break;
      case MasteryPacing.BELOW_GRADE_LEVEL:
        color = 'red';
        break;
      case MasteryPacing.AT_GRADE_LEVEL:
        color = 'yellow';
        break;
      default:
        return null;
    }

    let filename = `${color}-${startStatus}-${endStatus}`;
    if (color === 'red') {
      if (startStatus === 'likelyMastered') {
        filename = `${color}-likleyMastered-${endStatus}`;
      }
      if (startStatus === 'developing') {
        filename = `${color}-devloping-${endStatus}`;
      }
    }

    return masteryChangeGraphs[filename as keyof typeof masteryChangeGraphs] || null;
  };

  const graphPath = getMasteryChangeGraphPath();

  const getTranslatedDisplayText = () => {
    const mappedStatus = statusMapping[status as keyof typeof statusMapping] || status;
    
    // Map the status to translation keys
    const getTranslationKey = (statusValue: string): string | null => {
      switch (statusValue) {
        case MasteryStatus.NOT_DEVELOPED:
        case MasteryPacing.BELOW_GRADE_LEVEL:
          return 'not_developed';
        case MasteryStatus.DEVELOPING:
        case MasteryPacing.AT_GRADE_LEVEL:
          return 'developing';
        case MasteryStatus.LIKELY_MASTERED:
        case MasteryPacing.AHEAD_OF_GRADE_LEVEL:
          return 'likely_mastered';
        case MasteryStatus.NO_DATA:
        case MasteryPacing.NO_DATA:
          return 'no_data';
        default:
          return null;
      }
    };

    const translationKey = getTranslationKey(mappedStatus as string);
    
    if (translationKey) {
      return tStandardsMasteryReport(translationKey);
    }

    // Fallback to the original logic if no translation key is found
    return (mappedStatus as string).replace('_', ' ').toLowerCase().replace(/^./, char => char.toUpperCase());
  };

  return (
    <div className={`d-flex flex align-items-start status-card status-card-${status}${!showGraph || !graphPath ? ' status-card--no-graph' : ''}${mini ? ' status-card--mini' : ''}`}>
      {graphPath && !preReqModal && (
        <div className="mastery-change-graph">
          <img src={graphPath} alt="Mastery change graph" />
        </div>
      )}
      <div className="status-card-container d-flex flex-column align-items-start">
        <div className="status-card-content d-flex align-items-center w-100 justify-content-between">
          <div className="d-flex align-items-start gap-2">
            {!showGraph && (
              <div className="status-dot-container">
                <div className="status-dot" />
              </div>
            )}
            <div className="d-flex flex-column align-items-start">
              <span className="status-text">{getTranslatedDisplayText()}</span>
              {inference ? (
                <>
                  <span className="status-card-text">{mini ? tStudentMasteryGroup('estimated_mastery') : tStudentMasteryGroup('estimated_skills_mastery')}</span>
                  <span className="status-card-text">&nbsp;</span>
                </>
              ) : (
                <>
                  <span className="status-card-text">
                    {errors} {errors === 1 ? tCommon('error') : tSkillsStatusReport('error_plural')}
                  </span>
                  <span className="status-card-text">
                    {observations} {observations === 1 ? tCommon('observation') : tSkillsStatusReport('observation_plural')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="status-card-change">
          {!preReqModal && <MasteryChangeIndicator startMastery={masteryStart} endMastery={masteryEnd} />}
        </div>
      </div>
    </div>
  )
}