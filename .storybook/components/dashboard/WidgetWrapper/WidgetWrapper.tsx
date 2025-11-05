import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WidgetBase } from '@models';
import { AsyncLoadingState, WidgetType, WidgetAssessmentStatus as WidgetAssessmentStatusEnum } from '@enums';
import { Placeholder, NotchedContainer } from "@components/global";
import { ButtonThemed as Button } from '@components/shared';
import { Popover } from 'bootstrap';
import KebabIcon from '/images/icons/kebab.svg';

import './WidgetWrapper.scss';


type WidgetStatusState = (typeof AsyncLoadingState) & (typeof WidgetAssessmentStatusEnum);

export const WidgetWrapper: React.FC<WidgetBase> = ({
  actions,
  status,
  type,
  icon,
  data,
  children,
  loadingState,
  isCollapsed,
  onCollapserHandler,
  options,
  id,
  overriddenTitle,
  alignment,
  dataTestId
}) => {
  // All possible widget states need to be identified
  const StatusCombined: WidgetStatusState = {
    ...AsyncLoadingState,
    ...WidgetAssessmentStatusEnum
  };
  const { t } = useTranslation('dashboard');
  const popoverRef = useRef<HTMLButtonElement>(null);
  const [popoverContent, setPopoverContent] = useState<HTMLElement | null>()
  const widgetKey = WidgetType[type as unknown as keyof typeof WidgetType];
  // const [hasRelevantAlerts, setHasRelevantAlerts] = useState(false);
  // const { alerts, onToggleCollapse, onSlideChange } = useAmiraMessage();

  useEffect(() => {
    if (!options || !popoverRef) {
      console.log('Popover options or reference not available');
      return;
    }

    const popoverTriggerEl = popoverRef.current;
    const pc = document.getElementById(options.popoverContentId);
    if (!popoverContent) {
      setPopoverContent(pc as HTMLElement);
    }

    if (popoverTriggerEl) {
      console.log('Initializing popover for:', popoverTriggerEl);
      const popoverInstance = new Popover(popoverTriggerEl, {
        html: true,
        sanitize: false, // Allow raw HTML
        placement: options?.placement,
        trigger: 'click',
        content: popoverContent ?? pc as HTMLElement,
      });

      // Event delegation to handle button click
      const handleButtonClick = (event: Event) => {
        const clickTargetId = (event.target as HTMLElement).id;
        console.log('Button clicked:', clickTargetId);
        if (clickTargetId) {
          const optionCallback = options.action[clickTargetId];
          if (optionCallback) {
            optionCallback();
          }
        }

        // Hide the popover if the user clicks outside of the popover
        if (
          popoverInstance &&
          popoverRef.current &&
          !popoverRef.current.contains(event.target as Node)
        ) {
          popoverInstance.hide();
        }
      };

      document.addEventListener('click', handleButtonClick);

      // Cleanup event listener
      return () => {
        console.log('Cleaning up popover for:', popoverTriggerEl);
        document.removeEventListener('click', handleButtonClick);
        popoverInstance.dispose(); // Dispose of the popover to prevent memory leaks
      };
    }
  }, [options, popoverContent]); // Ensure dependencies are correct


  return (
    <div className="widget-wrapper position-relative mb-2 w-100">
      <NotchedContainer
        data-testid={dataTestId}
        className={`widget ${isCollapsed ? "collapsed" : ""}`}
        isCollapsed={isCollapsed}
        notchDepth={20}
        notchPosition="topRight"
        title={
          <div className="widget-header">
            <button
              className={`widget-header-collapser`}
              onClick={onCollapserHandler}>
              {status && (
                <i
                  className={`widget-icon widget-status widget-status-${status ?? "none"}`}></i>
              )}
              {!status && icon && (
                <i className="widget-icon">
                  <img src={icon} />
                </i>
              )}
              {overriddenTitle ? (
                <h3>{overriddenTitle}</h3>
              ) : (
                <h3>{t(`WIDGET_TITLE_${widgetKey}`)}</h3>
              )}
              {alignment}
            </button>
            {options && (
              <button
                id={`${id}-options`}
                className="widget-header-options"
                ref={popoverRef}>
                <img className="widget-header-options-icon" src={KebabIcon} />
              </button>
            )}
          </div>
        }>
        {isCollapsed ? (
          <div style={{ height: "300px" }} />
        ) : loadingState === AsyncLoadingState.LOADING ? (
          <div className="widget-body">
            <Placeholder colWidth={12} heightInRem={16.25} />
          </div>
        ) : children }
        {isCollapsed
          ? null
          : loadingState === AsyncLoadingState.SUCCESS &&
            actions &&
            actions.length > 0 && (
              <footer className="widget-footer widget-btn-group">
                {actions.map(a => (
                  <Button
                    variant={a.variant}
                    key={t(`WIDGET_CTA_${widgetKey}`)}
                    onClick={a.handler}>
                    {t(`WIDGET_CTA_${widgetKey}`)}
                  </Button>
                ))}
              </footer>
            )}
            </NotchedContainer>
    </div>
  );

};