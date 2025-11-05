import React from 'react';
import './WidgetDataReloadButton.scss';
import ReloadIcon from "/images/icons/arrow-refresh.svg";
import { useTranslation } from 'react-i18next';
interface WidgetDataReloadButtonProps {
  onReload: () => void;
  text?: string;
}

export const WidgetDataReloadButton = ({
  onReload,
  text,
}: WidgetDataReloadButtonProps) => {
  const { t } = useTranslation('dashboard');
  const buttonText = text || t('RELOAD');
  return (
    <button
      onClick={onReload}
      className="button-with-icon-outcomes d-flex align-items-center"
    >
      <span className="button-with-icon-outcomes-text">{buttonText}</span>
      <img className="retry-icon mr-2" src={ReloadIcon} alt="reload" />
    </button>
  );
};