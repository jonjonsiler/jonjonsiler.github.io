import React from "react";
import { useTranslation } from "react-i18next";

import "./loading-failure.scss";
import arrowRefresh from "/images/icons/arrow-refresh.svg";

export const LoadingFailure = ({
  onReload,
  style,
}: {
  onReload: () => void;
  style?: React.CSSProperties;
}) => {
  const { t } = useTranslation(['dashboard']);

  return (
    <div className="data-failed-container" style={style}>
      <span className="data-failed-text">{t('DATA_FAILED_TO_LOAD')}</span>
      <button
        className="reload-button"
        onClick={onReload}
        style={{ border: "none" }}
      >
        {t('RELOAD')} <img src={arrowRefresh.src} />
      </button>
    </div>
  );
}