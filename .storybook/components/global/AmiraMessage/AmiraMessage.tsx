import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAmiraMessage } from './AmiraMessageContext';
import { Carousel }from 'bootstrap';
import { ModalPortal } from '@components/global';
import { createPortal } from 'react-dom';
import {
  GreetingArrowIcon,
  GreetingSparklesIcon,
  InformationIcon,
  ReviewStudentIcon,
  WaveformIcon,
  CelebrationIcon,
  GrowthIcon,
  ReportWorthLookIcon,
} from './icons';
import closeIcon from '/images/icons/close-white.svg';
// import setupChat from '@/components/Helpers/ChatSupport';
import * as ModalTemplates from './ModalTemplates';
import { AlertUrgency, AlertType, AlertContentType } from '@enums';
import cx from 'classnames';
import resizeIcon from '/images/icons/resize.svg';
import * as AmiraPoses from './images';
// import { Howl } from 'howler';
import { useGreetingMessage } from '@hooks';
import { Arrow } from '@components/global/icons';

import './AmiraMessage.scss';
import { useSelector } from 'react-redux';
import type { RootState } from '@models';

// import LottieAnimation from '../Lottie/LottieAnimation';
// import AmiraWave from '../Lottie/lottiejson/AmiraGreetingWave.json';
// import { LottieRefCurrentProps } from '~/lottie-react/build';
import { useNavigate } from 'react-router-dom';

// #region Models, Types, and Interfaces
/* TODO: Replace with new model*/


interface AmiraMessageProps {
  children?: React.ReactNode;
}

interface BaseContentProps {
  className?: string;
  renderOverlay?: boolean;
  animateOverlay?: boolean;
  isDataLoaded?: boolean;
  greetingMessages?: { key: string; message: string; priority: number }[];
}

interface GreetingOverlayProps {
  onClick: () => void;
  animateOut: boolean;
  onShrinkAnimationEnd: () => void;
  className?: string;
}

interface BubblePortalProps {
  alerts: any[];
  activeIndex: number;
  onSlideChange: (index: number) => void;
  closeMessages: () => void;
  isVisible: boolean;
  className?: string;
}

interface AmiraMessageComponent extends React.FC<AmiraMessageProps> {
  Avatar: React.FC<BaseContentProps>;
  Content: React.FC<BaseContentProps & { index: number }>;
  MuteButton: React.FC<BaseContentProps>;
  GreetingOverlay: React.FC<GreetingOverlayProps>;
  BubblePortal: React.FC<BubblePortalProps>;
}
// #endregion

// #region Helpers
interface PoseDimensionStyle {
  width?: string;
  height?: string;
  bottom?: string;
  left?: string;
}

interface PoseStyleSet {
  default: PoseDimensionStyle;
  modalOpen: PoseDimensionStyle;
}

const amiraPoseStylesConfig: Partial<Record<AlertContentType | 'toast-success' | 'toast-failure' | 'default', PoseStyleSet>> = {
  [AlertContentType.ReportWorthLook]: {
    default: { width: '100%', height: '100%', bottom: '1.39rem', left: '1.7rem' },
    modalOpen: { width: '95%', height: '100%', bottom: '1.46rem', left: '1.9rem' },
  },
  [AlertContentType.Celebration]: {
    default: { width: '80%', height: '100%', bottom: '1.1rem', left: '2.4rem' },
    modalOpen: { width: '75%', height: '100%', bottom: '1.4rem', left: '2.3rem' },
  },
  [AlertContentType.SystemMessages]: {
    default: { width: '90%', height: '100%', bottom: '1.2rem', left: '2.4rem' },
    modalOpen: { width: '90%', height: '100%', bottom: '1.1rem', left: '2.4rem' },
  },
  [AlertContentType.PD]: {
    default: { width: '75%', height: '100%', bottom: '1.1rem', left: '2.2rem' },
    modalOpen: { width: '75%', height: '100%', bottom: '1.37rem', left: '2.1rem' },
  },
  [AlertContentType.ReviewStudent]: {
    default: { width: '75%', height: '100%', bottom: '1.49rem', left: '2.3rem' },
    modalOpen: { width: '75%', height: '100%', bottom: '1.49rem', left: '2.3rem' },
  },
  [AlertContentType.Growth]: {
    default: { width: '115%', height: '106%', bottom: '1.35rem', left: '1.44rem' },
    modalOpen: { width: '105%', height: '106%', bottom: '1.2rem', left: '2.1rem' },
  },
  ['toast-success']: {
    default: { width: '87%', height: '100%', bottom: '1.1rem', left: '2.4rem' },
    modalOpen: { width: '87%', height: '100%', bottom: '1.1rem', left: '2.4rem' },
  },
  ['toast-failure']: {
    default: { width: '73%', height: '100%', bottom: '1.39rem', left: '2.38rem' },
    modalOpen: { width: '73%', height: '100%', bottom: '1.39rem', left: '2.38rem' },
  },
  ['default']: {
    default: { width: '75%', height: '100%', bottom: '1.4rem', left: '2.2rem' },
    modalOpen: { width: '75%', height: '100%', bottom: '1.4rem', left: '2.2rem' },
  },
};

const GREETING_OVERLAY_VISIBLE_SESSION_KEY = 'greeting-overlay-visible-session';

const getAmiraPoseStyles = (
  contentType: AlertContentType | undefined,
  isModalOpen: boolean,
  activeToast?: any
): React.CSSProperties => {
  if (activeToast && activeToast.type) {
    const toastStyleKey = `toast-${activeToast.type}` as keyof typeof amiraPoseStylesConfig;
    const toastStyles = amiraPoseStylesConfig[toastStyleKey];
    if (toastStyles) {
      const poseStateSpecificStyles = isModalOpen
        ? toastStyles.modalOpen
        : toastStyles.default;

      const finalStyles: React.CSSProperties = {};
      if (poseStateSpecificStyles.width !== undefined) finalStyles.width = poseStateSpecificStyles.width;
      if (poseStateSpecificStyles.height !== undefined) finalStyles.height = poseStateSpecificStyles.height;
      if (poseStateSpecificStyles.bottom !== undefined) finalStyles.bottom = poseStateSpecificStyles.bottom;
      if (poseStateSpecificStyles.left !== undefined) finalStyles.left = poseStateSpecificStyles.left;

      return finalStyles;
    }
  }

  if (!contentType || !amiraPoseStylesConfig[contentType]) {
    const defaultStyles = amiraPoseStylesConfig['default'];
    if (defaultStyles) {
      const poseStateSpecificStyles = isModalOpen
        ? defaultStyles.modalOpen
        : defaultStyles.default;

      const finalStyles: React.CSSProperties = {};
      if (poseStateSpecificStyles.width !== undefined) finalStyles.width = poseStateSpecificStyles.width;
      if (poseStateSpecificStyles.height !== undefined) finalStyles.height = poseStateSpecificStyles.height;
      if (poseStateSpecificStyles.bottom !== undefined) finalStyles.bottom = poseStateSpecificStyles.bottom;
      if (poseStateSpecificStyles.left !== undefined) finalStyles.left = poseStateSpecificStyles.left;

      return finalStyles;
    }
    return {};
  }

  const stylesForContentType = contentType ? amiraPoseStylesConfig[contentType] : undefined;
  if (!stylesForContentType) {
    return {};
  }

  const poseStateSpecificStyles = isModalOpen
    ? stylesForContentType.modalOpen
    : stylesForContentType.default;

  const finalStyles: React.CSSProperties = {};
  if (poseStateSpecificStyles.width !== undefined) finalStyles.width = poseStateSpecificStyles.width;
  if (poseStateSpecificStyles.height !== undefined) finalStyles.height = poseStateSpecificStyles.height;
  if (poseStateSpecificStyles.bottom !== undefined) finalStyles.bottom = poseStateSpecificStyles.bottom;
  if (poseStateSpecificStyles.left !== undefined) finalStyles.left = poseStateSpecificStyles.left;

  return finalStyles;
};

const getIconComponent = (type: AlertType) => {
  switch (type) {
       
    case AlertType.LessonPlanFixNeeded:
    case AlertType.AssignmentRecommended:
    case AlertType.SkillGapNeedsAttention:
      return <GrowthIcon />;

    case AlertType.StudentSkillGapFilled:
    case AlertType.StudentBadgeEarned:
      return <CelebrationIcon />;
    
    // Reassessment Icon (X/Cross)
    case AlertType.ReviewTestScoring:
    case AlertType.StudentNotReadingOrEngaging:
    case AlertType.AssessmentHasReviewNeededYellowFlagging: 
    case AlertType.ReassessStudent:
      return <ReviewStudentIcon />;
    
    // Information Icon (Default)
    case AlertType.ReadingRiskFlagged:
      return <ReportWorthLookIcon />;

    default:
      return <InformationIcon />;
  }
};

// Helper function to get the appropriate template component
const getModalTemplateComponent = (alertType: AlertType) => {
  // If alert has an explicit alertType, use it to determine the template
  if (alertType) {
    switch (alertType) {
      case AlertType.ReassessStudent:
        return <ModalTemplates.ReassessStudent />;
      case AlertType.ReviewTestScoring:
        return <ModalTemplates.ReviewTestScoring />;
      case AlertType.StudentBadgeEarned:
        return <ModalTemplates.StudentBadgeEarned />;
      case AlertType.ReadingRiskFlagged:
        return <ModalTemplates.ReadingRiskFlagged />;
      case AlertType.StudentNotReadingOrEngaging:
        return <ModalTemplates.StudentNotReadingOrEngaging />;
      case AlertType.AssessmentHasReviewNeededYellowFlagging:
        return <ModalTemplates.AssessmentHasReviewNeededYellowFlagging />;
      case AlertType.SkillGapNeedsAttention:
        return <ModalTemplates.SkillGapNeedsAttention />;
      case AlertType.StudentSkillGapFilled:
        return <ModalTemplates.StudentSkillGapFilled />;
      case AlertType.LessonPlanFixNeeded:
        return <ModalTemplates.LessonPlanFixNeeded />;
      case AlertType.AssignmentRecommended:
        return <ModalTemplates.AssignmentRecommended />;
      default:
        break;
    }
  }
};

const getAmiraPoseContentTypeAvatar = (contentType: AlertContentType, isModalOpen: boolean, activeToast: any) => {

  if (activeToast && activeToast.type) {
    if (activeToast.type === 'success') {
      return AmiraPoses.AmiraSuccess;
    }
    if (activeToast.type === 'failure') {
      return AmiraPoses.AmiraFailure;
    }
  }
  switch (contentType) {
    case AlertContentType.ReportWorthLook:
      return isModalOpen ? AmiraPoses.AmiraViewReportAlertModalOpen : AmiraPoses.AmiraViewReportDefault;
    case AlertContentType.Celebration:
      return isModalOpen ? AmiraPoses.AmiraCelebrationAlertModalOpen : AmiraPoses.AmiraCelebrationDefault;
    case AlertContentType.Growth:
      return isModalOpen ? AmiraPoses.AmiraGrowthAlertModalOpen : AmiraPoses.AmiraGrowthDefault;
    case AlertContentType.ReviewStudent:
      return isModalOpen ? AmiraPoses.AmiraReviewStudentAlertModalOpen : AmiraPoses.AmiraReviewStudentDefault;
    case AlertContentType.SystemMessages:
      return isModalOpen ? AmiraPoses.AmiraSystemStatusAlertModalOpen : AmiraPoses.AmiraSystemStatusDefault;
    case AlertContentType.PD:
      return isModalOpen ? AmiraPoses.AmiraPDAlertModalOpen : AmiraPoses.AmiraPDDefault;
    default:
      return AmiraPoses.AmiraDefault;
  }
}
// #endregion

// #region Compound Components features
const Avatar: React.FC<BaseContentProps> = ({
  className = '',
  renderOverlay,
  animateOverlay,
  isDataLoaded,
  greetingMessages,
}) => {
  const { alerts, isCollapsed, onToggleCollapse, isModalOpen, activeIndex, speechProps } = useAmiraMessage();
  // const lottieRef = useRef<LottieRefCurrentProps>(null);
  const {t} = useTranslation("alerts");

  const activeToast = useSelector((state: RootState) => state.toast.activeToast);
  const currentAlert = alerts[activeIndex];
  let amiraPose = null;

  const [loadedImage, setLoadedImage] = useState<string | null>(null);

  if (currentAlert?.contentType && loadedImage || activeToast) {
    amiraPose = loadedImage;
  } else if (currentAlert?.contentType || activeToast) {
    try {
      const contentTypeAvatar = getAmiraPoseContentTypeAvatar(currentAlert?.contentType, isModalOpen, activeToast);
      if (contentTypeAvatar) {
        amiraPose = contentTypeAvatar;
      }
    } catch (error) {
      amiraPose = AmiraPoses.AmiraDefault;
      console.warn('Error loading avatar image:', error);
    }
  }
  const [initialSessionKeyExists] = useState(() =>
    sessionStorage.getItem(GREETING_OVERLAY_VISIBLE_SESSION_KEY) !== null
  );
  const amiraDefault = initialSessionKeyExists ||
    (!speechProps.isSpeaking && greetingMessages?.length === 0 && isDataLoaded);
  const dynamicStyles = getAmiraPoseStyles(currentAlert?.contentType, isModalOpen, activeToast);

  const alertCount = alerts.length || 0;
  // const soundRef = useRef<Howl | null>(null);

  useEffect(() => {
    if (currentAlert?.contentType || activeToast) {
      try {
        const contentTypeAvatar = getAmiraPoseContentTypeAvatar(currentAlert?.contentType, isModalOpen, activeToast);
        if (contentTypeAvatar) {
          const img = new Image();
          img.src = contentTypeAvatar;
          img.onload = () => {
            setLoadedImage(contentTypeAvatar);
          };
        }
      } catch (error) {
        setLoadedImage(AmiraPoses.AmiraDefault);
        console.warn('Error loading avatar image:', error);
      }
    }
  }, [currentAlert, isModalOpen, activeToast]);


  // useEffect(() => {
  //   const currentAvatarSpeechProps = speechProps?.avatarSpeechProps;
  //   if (currentAvatarSpeechProps?.audioURL) {
  //     // Cleanup previous sound if any
  //     if (soundRef.current) {
  //       soundRef.current.stop();
  //       soundRef.current.unload();
  //     }

  //     const newSound = new Howl({
  //       src: [currentAvatarSpeechProps.audioURL],
  //       format: ['mp3'],
  //       html5: true, // Or use shouldForceHTML5Audio() if applicable here
  //       onplay: () => {
  //         if (currentAvatarSpeechProps.onStart) {
  //           currentAvatarSpeechProps.onStart();
  //         }
  //       },
  //       onend: () => {
  //         if (currentAvatarSpeechProps.onEnd) {
  //           currentAvatarSpeechProps.onEnd();
  //         }
  //         soundRef.current = null; // Clear ref after sound ends
  //       },
  //       onstop: () => { // Also handle manual stop if needed
  //         if (currentAvatarSpeechProps.onEnd) {
  //           currentAvatarSpeechProps.onEnd();
  //         }
  //         soundRef.current = null;
  //       },
  //       onloaderror: (id: number | string, error: any) => {
  //         console.error("Avatar audio load error:", error);
  //         if (currentAvatarSpeechProps.onError) {
  //           currentAvatarSpeechProps.onError();
  //         } else if (currentAvatarSpeechProps.onEnd) { // Ensure onEnd is called to unblock queue
  //           currentAvatarSpeechProps.onEnd();
  //         }
  //         soundRef.current = null;
  //       },
  //       onplayerror: (id: number | string, error: any) => {
  //         console.error("Avatar audio play error:", error);
  //         if (currentAvatarSpeechProps.onError) {
  //           currentAvatarSpeechProps.onError();
  //         } else if (currentAvatarSpeechProps.onEnd) { // Ensure onEnd is called to unblock queue
  //           currentAvatarSpeechProps.onEnd();
  //         }
  //         soundRef.current = null;
  //       },
  //     });
  //     newSound.play();
  //     soundRef.current = newSound;
  //   }

  //   return () => {
  //     // Cleanup sound when component unmounts or audioURL changes triggering effect cleanup
  //     if (soundRef.current) {
  //       soundRef.current.stop();
  //       soundRef.current.unload();
  //       soundRef.current = null;
  //     }
  //   };
  // }, [speechProps?.avatarSpeechProps?.audioURL]); // Effect depends on audioURL

  // useEffect(() => {
  //   if (renderOverlay === false && animateOverlay === false) {
  //     lottieRef.current?.stop();
  //   } else {
  //     lottieRef.current?.play();
  //   }
  // }, [renderOverlay, animateOverlay]);

  return (
    <div
      className={`amira-message-avatar ${className}`}
      data-testid="amira-avatar"
    >
      <img
        src={amiraPose ? amiraPose : AmiraPoses.AmiraDefault}
        alt="Amira"
        style={dynamicStyles}
      />
      <aside id="amira-chatbot-widget"></aside>
      <AmiraMessage.MuteButton />
      {isCollapsed && alertCount > 0 && (
        <button
          type="button"
          className="amira-message-badge"
          onClick={() => isCollapsed && onToggleCollapse && onToggleCollapse(false)}
          aria-label="Toggle alerts"
        >
          {alertCount > 99 ? '99+' : alertCount}
          <span>
            {t('ALERTS_BUBBLE', {count: alertCount})}
            <img src={resizeIcon} className="icon icon-resize" />
          </span>
        </button>
      )}
    </div>
  );
};

const Controls: React.FC<BaseContentProps> = ({ className = '' }) => {
  const { alerts, activeIndex, onDismiss, onSnooze } = useAmiraMessage();
  const {t} = useTranslation("translation");
  if (!alerts || alerts.length === 0) return null;
  const alert = alerts[activeIndex];
  return (alert ?
    <div className={`btn-group amira-message-actions ${className}`}>
      <button
        type="button"
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        {t("dismiss")}
      </button>
      <button
        type="button"
        onClick={() => onSnooze(alert.id)}
        aria-label="Snooze alert"
      >
        {t("snooze")}
      </button>
    </div>
    : null
  );
};

const Content: React.FC<BaseContentProps & { index: number }> = ({ className = '', index }) => {
  const { alerts, onToggleModal, onToggleCollapse, isCollapsed, onDismiss, onDismissAllOfType } = useAmiraMessage();
  const { t } = useTranslation(['alerts']);
  const navigate = useNavigate();
  
  if (!alerts || alerts.length === 0 || alerts.length <= index) return null;
  const alert = alerts[index];
  if (!alert) return null;
  const studentSize = alert.studentIds.length;
  const isPlural = studentSize > 1;
  
  const handleCallToActionClick = () => {    
    // Mark that user has interacted with alerts to prevent auto-opening
    sessionStorage.setItem('amira-alerts-user-interacted', 'true');
    
    // Always collapse the alert bubble first
    if (!isCollapsed) {
      onToggleCollapse(true);
    }
    
    // Handle different actions based on alert type
    switch (alert.type) {
      case AlertType.ReassessStudent:
      case AlertType.ReviewTestScoring:
      case AlertType.AssessmentHasReviewNeededYellowFlagging:
        // Navigate to dashboard with state to open student list modal
        // Add timestamp to ensure unique navigation even when already on dashboard
        navigate('/dashboard', { 
          state: { 
            openStudentListModal: true,
            timestamp: Date.now() 
          } 
        });
        // Dismiss all alerts of this type since user is addressing the underlying issue
        onDismissAllOfType(alert.type);
        break;
        
      case AlertType.StudentNotReadingOrEngaging:
        // Keep the existing modal behavior
        onToggleModal(true);
        break;
        
      case AlertType.ReadingRiskFlagged:
        // Navigate to dyslexia report
        navigate('/teacher/reports/type/dyslexiarisk');
        // Dismiss all alerts of this type since user is addressing the underlying issue
        onDismissAllOfType(alert.type);
        break;
        
      case AlertType.SkillGapNeedsAttention:
        // Open the modal to show students needing attention and allow individual assignment
        onToggleModal(true);
        break;
        
      case AlertType.StudentSkillGapFilled:
        // Open the modal to show student progress and skill improvements
        onToggleModal(true);
        break;
        
      case AlertType.LessonPlanAutoFix:
        // Open the modal to show the auto fix results
        // Auto fix modal will handle dismissing the alert
        // Auto fix alerts only are shown when a user visits the lesson detail page
        onToggleModal(true);
        break;
        
      case AlertType.StudentBadgeEarned:
        // Navigate to badging report
        navigate('/teacher/reports/type/badging');
        // Dismiss all alerts of this type since user is addressing the underlying issue
        onDismissAllOfType(alert.type);
        break;
        
      case AlertType.LessonPlanFixNeeded:
      case AlertType.AssignmentRecommended:
        // Navigate to main planner page
        navigate('/planner/rollover');
        // Dismiss all alerts of this type since user is addressing the underlying issue
        onDismissAllOfType(alert.type);
        break;
      
      default:
        // For these types, still open the modal (existing behavior)
        onToggleModal(true);
        break;
    }
  };
  
  return (
    <div className={`amira-message-content ${className}`}>
      <div className="amira-message-icon">{getIconComponent(alert.type)}</div>
      <div className="amira-message-text">
        <h3>{alert.title.length > 0 ? alert.title : t(`${alert.type}.${isPlural ? 'bubble_header_grouped' : 'bubble_header'}`, {count: studentSize})}</h3>
          <button
            className="amira-message-action"
            onClick={handleCallToActionClick}
          >
            <span>{t(`${alert.type}.callToAction`)}</span>
            <i className="icon"><Arrow /></i>
          </button>
        <Controls />
      </div>
    </div>
  );
};

const MuteButton: React.FC<BaseContentProps> = ({ className = "" }) => {
  // const { onMute, isMuted } = useAmiraMessage();.
  const { speechProps } = useAmiraMessage();
  const { isSpeaking } = speechProps;
  return (
    <div
      className={`amira-message-mute ${className} ${isSpeaking ? "speaking" : ""}`}>
      <WaveformIcon />
    </div>
  );
  // TODO: integrate Mute button when we the requirements will change
  // return (
  //   <button
  //     className={`amira-message-mute ${className}`}
  //     onClick={onMute}
  //     aria-label={isMuted ? 'Unmute alerts' : 'Mute alerts'}
  //   >
  //     {isMuted ? '🔇' :  <MuteIcon />}
  //   </button>
  // );
};

const GreetingOverlay: React.FC<GreetingOverlayProps> = ({
  onClick,
  animateOut,
  onShrinkAnimationEnd,
  className,
}) => {
  const { t } = useTranslation("amira_greeting_message");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const node = buttonRef.current;
    if (animateOut && node) {
      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName === "shrinkSpotlight") {
          onShrinkAnimationEnd();
        }
      };
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    }
  }, [animateOut, onShrinkAnimationEnd]);

  return (
    <div className={`amira-message-greeting-overlay ${className || ""}`.trim()}>
      <div className="amira-greeting-prompt">
        <GreetingSparklesIcon />
        <GreetingArrowIcon />
        <p className="amira-greeting-prompt-text">{t('click_here')}</p>
      </div>
      <button
        ref={buttonRef}
        className={animateOut ? "shrinking" : ""}
        onClick={() => {
          onClick();
          setIsDisabled(true);
        }}
        disabled={isDisabled}
        aria-label="Close greeting overlay"
      >
        <div className='overlay-circle' />
      </button>
    </div>
  );
};
// #endregion

// #region Bubble Portal Component
const BubblePortal: React.FC<BubblePortalProps> = ({
  alerts,
  activeIndex,
  onSlideChange,
  closeMessages,
  isVisible,
  className
}) => {
  const { t } = useTranslation(['alerts']);
  
  if (!isVisible || alerts.length === 0) {
    return null;
  }

  const bubbleContent = (
    <div className={`${className || ''}`}>
      <div className={`amira-message-bubble`}>
        <button
          className="amira-message-close"
          onClick={closeMessages}
          aria-label="Close alerts"
        >
          <img src={closeIcon} alt="Close" />
        </button>
        <div className="carousel-legend">{activeIndex + 1} of {alerts.length}</div>
        <Carousel
          slide
          interval={null}
          controls={alerts.length > 1}
          indicators={false}
          onSelect={onSlideChange}
          className="amira-message-carousel"
          activeIndex={activeIndex}
          data-testid="mock-carousel"
        >
          {alerts.map((alert, index) => (
            <Carousel.Item key={alert.id}>
              <AmiraMessage.Content index={index} />
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );

  // Create or get the amira-message-root element under root
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.warn('Root element not found for AmiraMessage bubble portal');
    return null;
  }

  let amiraMessageRoot = document.getElementById('amira-message-root');
  if (!amiraMessageRoot) {
    amiraMessageRoot = document.createElement('div');
    amiraMessageRoot.id = 'amira-message-root';
    rootElement.appendChild(amiraMessageRoot);
  }

  return createPortal(bubbleContent, amiraMessageRoot);
};

// #endregion

// #region Main Component
const AmiraMessage: AmiraMessageComponent = () => {
  const {t} = useTranslation("alerts");
  const {
    alerts,
    isModalOpen,
    isCollapsed = false,
    activeIndex = 0,
    onToggleCollapse,
    onToggleModal,
    onSlideChange,
  } = useAmiraMessage();
  const { speechProps } = useAmiraMessage();
  const { greetingMessages, dequeueMessage, isDataLoaded } = useGreetingMessage();

  const closeMessages = () => onToggleCollapse && onToggleCollapse(true);
  const closeModal = () => {
    // Mark that user has interacted with alerts to prevent auto-opening
    sessionStorage.setItem('amira-alerts-user-interacted', 'true');
    
    onToggleModal && onToggleModal(false);
    onToggleCollapse && onToggleCollapse(false);
  };
  // useEffect(() => {
  //   setupChat();
  // }, []);

  // Control body overflow during transitions
  useEffect(() => {
    const body = document.body;
    if (isCollapsed === false && alerts.length > 0) {
      // Add class when expanding
      body.classList.add('amira-message-transitioning');
      const timer = setTimeout(() => {
        body.classList.remove('amira-message-transitioning');
      }, 600); // Remove after transition completes
      return () => {
        clearTimeout(timer);
        body.classList.remove('amira-message-transitioning');
      };
    }
  }, [isCollapsed, alerts.length]);

  const classNames = cx(
    'amira-message',
    `amira-message-${alerts[activeIndex]?.urgency || AlertUrgency.Common}`,
    {
      collapsed: isCollapsed,
      'amira-message-inspect': isModalOpen,
    }
  );
  const bubbleClassNames = cx(
    'amira-message-bubble-container',
    `amira-message-${alerts[activeIndex]?.urgency || AlertUrgency.Common}`,
    {
      collapsed: isCollapsed,
      'amira-message-inspect': isModalOpen,
    }
  );

  const [renderOverlay, setRenderOverlay] = useState(sessionStorage.getItem(GREETING_OVERLAY_VISIBLE_SESSION_KEY) !== null ? false : true);
  const [animateOverlayOut, setAnimateOverlayOut] = useState(false);

  const [initialSessionKeyExists] = useState(() =>
    sessionStorage.getItem(GREETING_OVERLAY_VISIBLE_SESSION_KEY) !== null
  );

  // Common function to play the next greeting message
  const playNextGreetingMessageIfNotSpeaking = useCallback(() => {
    if (
      speechProps &&
      speechProps.speak &&
      !speechProps.isSpeaking &&
      greetingMessages.length > 0
    ) {
      const messageToPlay = greetingMessages[0];
      if (messageToPlay) {
        // Using a timeout consistent with previous logic
        // This also helps prevent trying to speak too rapidly if this function is called quickly.
        const timerId = setTimeout(() => {
          speechProps.speak(
            {
              textToSpeak: messageToPlay.message,
              onEnd: () => {
                dequeueMessage();
              },
            }
          );
        }, 200);
        // Return a cleanup function for the timeout if this is used in an effect that might re-run
        return () => clearTimeout(timerId);
      }
    }
    return () => {}; // Default empty cleanup if conditions not met
  }, [speechProps, greetingMessages, dequeueMessage]); // Dependencies for useCallback

  const handleInitiateOverlayClose = () => {
    setAnimateOverlayOut(true);
    playNextGreetingMessageIfNotSpeaking(); // Call the common function
  };

  const handleOverlayShrinkAnimationEnd = () => {
    setRenderOverlay(false);
    setAnimateOverlayOut(false);
    sessionStorage.setItem(GREETING_OVERLAY_VISIBLE_SESSION_KEY, 'true');
  };

  const prevRenderOverlayRef = useRef(renderOverlay);

  useEffect(() => {
    if (prevRenderOverlayRef.current === true && renderOverlay === false) {
      // Transition from true to false detected
      const cleanupTimeout = playNextGreetingMessageIfNotSpeaking();
      return cleanupTimeout;
    }
    prevRenderOverlayRef.current = renderOverlay;
  }, [renderOverlay, playNextGreetingMessageIfNotSpeaking]);

  const amiraDefault = initialSessionKeyExists ||
    (!speechProps.isSpeaking && greetingMessages?.length === 0 && isDataLoaded);

  const getModalTitle = () => {
    const alertType = alerts[activeIndex]?.type;
    let text = "";
    if (alertType === AlertType.StudentNotReadingOrEngaging) {
      text = t("StudentNotReadingOrEngaging.modal_header", {
        count: alerts[activeIndex].studentIds.length,
      });
    } else if (alertType === AlertType.StudentSkillGapFilled) {
      text = t("StudentSkillGapFilled.modal_header", {
        count: alerts[activeIndex].studentIds.length,
      });
    } else if (alertType === AlertType.LessonPlanAutoFix) {
      text = t("LessonPlanAutoFix.modal_header");
    } else {
      text = t(`${alertType || "default"}.modal_header`);
    }
    return (
      <div className="amira-message-modal-header d-flex align-items-center">
        <div className="amira-message-icon pt-2 pb-2">{getIconComponent(alertType)}</div>
        {text}
      </div>
    );
  };

  return (
      <div
        className={classNames}
        data-testid="amira-message"
      >
        <BubblePortal
          alerts={alerts}
          activeIndex={activeIndex}
          onSlideChange={onSlideChange}
          closeMessages={closeMessages}
          isVisible={alerts.length > 0 && amiraDefault}
          className={bubbleClassNames}
        />

        <AmiraMessage.Avatar renderOverlay={renderOverlay} animateOverlay={animateOverlayOut} isDataLoaded={isDataLoaded} greetingMessages={greetingMessages}/>

        <ModalPortal
          isOpen={isModalOpen}
          onClose={closeModal}
          size="content"
          className="amira-message-modal"
        >
          <ModalPortal.Header title={getModalTitle()} onClose={closeModal} />
          <div className="modal-body">
          {alerts.length > 0 && alerts[activeIndex] && (
            <div>
              {alerts[activeIndex].modalContent ? (
                alerts[activeIndex].modalContent
              ) : (
                getModalTemplateComponent(alerts[activeIndex].type)
              )}
            </div>
          )}
          </div>
        </ModalPortal>

        {renderOverlay && (
          <AmiraMessage.GreetingOverlay
            onClick={handleInitiateOverlayClose}
            animateOut={animateOverlayOut}
            onShrinkAnimationEnd={handleOverlayShrinkAnimationEnd}
          />
        )}
      </div>
  );
};
// #endregion

// #region Exports
AmiraMessage.Avatar = Avatar;
AmiraMessage.Content = Content;
AmiraMessage.MuteButton = MuteButton;
AmiraMessage.GreetingOverlay = GreetingOverlay;
AmiraMessage.BubblePortal = BubblePortal;

export { AmiraMessage, Avatar, Content, MuteButton, GreetingOverlay, BubblePortal };
// #endregion
// #endregion