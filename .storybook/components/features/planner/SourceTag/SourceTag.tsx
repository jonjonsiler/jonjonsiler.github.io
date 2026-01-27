import React from 'react';
import { useTranslation } from 'react-i18next';
import districtIcon from "/images/icons/district-icon.svg?url";
import prerequisiteIcon from "/images/icons/prerequisite-skill-icon.svg?url";
import appleIcon from "/images/icons/apple-icon.svg?url";
import rolloverIcon from "/images/icons/incomplete-assignments-icon.svg?url";
import './SourceTag.scss';

interface SourceTagProps {
  source: string;
  className?: string;
  style?: React.CSSProperties;
}

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'PREREQUISITE':
      return prerequisiteIcon;
    case 'CORE':
      return districtIcon;
    case 'ROLLOVER':
      return rolloverIcon;
    case 'TEACHER_ASSIGNED':
      return appleIcon;
    default:
      return null;
  }
};

export const SourceTag: React.FC<SourceTagProps> = ({ source, style = { flex: '0 0 auto' } }) => {
  const { t } = useTranslation('common');
  const sourceIcon = getSourceIcon(source);

  return (
    <span className={'standards-container-source'} style={style}>
      {sourceIcon && <img src={sourceIcon} alt={source} />}
      <span className="standards-container-source-text">{t(source)}</span>
    </span>
  );
};
