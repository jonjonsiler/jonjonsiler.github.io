import React from 'react'
import './AssignmentModalHeader.scss';
import { useTranslation } from 'react-i18next';
import StatusCard from './StatusCard/StatusCard';
import { MasteryPacing } from '@enums';
import { StandardsDisplay } from '@components/features/planner/StandardsDisplay';
import { SourceTag } from '@components/features/planner/SourceTag/SourceTag';
// import { getAbbreviatedDomainTag } from '@utilities/getAbbreviatedDomain';

interface AssignmentModalHeaderProps {
  skillName: string;
  standards: any;
  domain: string;
  source: string;
  skillNameAbbreviation?: boolean;
  showActionCard?: boolean;
  className?: string;
  status?: MasteryPacing;
  bodyContent?: React.ReactNode;
  hideStandards?: boolean;
  toolTip?: boolean;
  mini?: boolean;
}

export const getAbbreviatedDomainTag = (domainAbbreviation: string) => {
  const abbreviatedDomainTags = {
    PA: 'PA',
    D: 'DEC',
    HFW: 'HFW',
    BK: 'BK',
    V: 'VOC',
    SR: 'SR',
  }
  return abbreviatedDomainTags[domainAbbreviation as keyof typeof abbreviatedDomainTags] || domainAbbreviation;
}

const getDomainTag = (domain: string, t: any) => {
  const domainTags = {
    PA: t('domain_pa'),
    D: t('domain_d'),
    HFW: t('domain_hfw'),
    BK: t('domain_bk'),
    V: t('domain_v'),
    SR: t('domain_sr'),
  }
  return domainTags[domain as keyof typeof domainTags] || domain;
}

export const SkillCardHeader = ({ skillName, standards, domain, source, skillNameAbbreviation, showActionCard, className, bodyContent, hideStandards, mini }: AssignmentModalHeaderProps) => {
  const { t } = useTranslation('common');

  const headerClassName = `assignment-modal-header ${className || ''} ${mini ? 'assignment-modal-header-mini' : ''}`;
  const skillNameClassName = `assignment-modal-header-skill-name w-100 ${mini ? 'assignment-modal-header-skill-name-mini' : ''}`;

  // Convert standards to array format for StandardsDisplay component
  const getStandardsArray = (standards: any): string[] => {
    if (!standards) return [];
    if (Array.isArray(standards)) return standards;
    if (typeof standards === 'string') {
      // Split comma-separated string back into array and clean up
      return standards.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };

  const standardsArray = getStandardsArray(standards);

  return (
    <div className={headerClassName}>
      <div className={`assignment-modal-header-domain-tag domain-${domain} ${mini ? 'assignment-modal-header-domain-tag-mini' : ''}`}>
        {skillNameAbbreviation ? getAbbreviatedDomainTag(domain) : getDomainTag(domain, t)}
      </div>
      <div className="assignment-modal-header-metadata-container">
        <div className="assignment-modal-header-content w-100 d-flex flex-column">
          {skillName && <div className="d-flex flex-column p-1 w-100">
            <h3 className={skillNameClassName}>{skillName}</h3>
          </div>}
          {!hideStandards && <div className="standards-container">
            {showActionCard ? (
              <StatusCard status={MasteryPacing.BELOW_GRADE_LEVEL} masteryStart={MasteryPacing.BELOW_GRADE_LEVEL} masteryEnd={MasteryPacing.BELOW_GRADE_LEVEL} observations={0} errors={0} />
            ) : (
              <div className="d-flex align-items-center justify-content-between w-100" style={{ gap: '1rem' }}>
                {standardsArray.length > 0 && (
                  <div style={{ flex: '0 1 auto' }}>
                    <StandardsDisplay 
                      standards={standardsArray} 
                      className="standards-display-assignment-modal"
                      showTop={false}
                    />
                  </div>
                )}
                   {source && <SourceTag source={source} />}
              </div>
            )}
          </div>}
        </div>
      </div>
      {bodyContent && (<>{bodyContent}</>)}
    </div>
  )
}
