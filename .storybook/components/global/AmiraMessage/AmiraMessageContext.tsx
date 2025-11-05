import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertUrgency, AlertType, AlertContentType } from '@enums';
import type { Alert as ApiAlert, AppDispatch, RootState, AmiraMessageAlert as Alert } from '@models';
import { AmiraMessage } from '@components/global';
import { getAlerts } from '@utilities';
import { useAccessToken, useSelectedClassroom } from '@hooks';
import type { Speech, SpeechPassedDownProps } from '@components/global';

export interface AmiraAlertContextType {
  activeIndex: number;
  alerts: Alert[];
  isCollapsed: boolean;
  isModalOpen: boolean;
  isMuted: boolean;
  speechProps: SpeechPassedDownProps;
  transcriptInfo: any;
  addAlert: (alert: Omit<Alert, 'id'>) => string;
  onDismiss: (id: string) => void;
  onDismissAllOfType: (alertType: AlertType) => void;
  onRemoveStudentFromAlert: (alertId: string, studentId: number) => void;
  onSnooze: (id: string) => void;
  clearAllAlerts: () => void;
  onMute: () => void;
  onToggleModal: (open: boolean) => void;
  onToggleCollapse: (collapsed: boolean) => void;
  onSlideChange: (index: number) => void;
}

export const AmiraAlertContext = createContext<AmiraAlertContextType | undefined>(undefined);

// Helper function to convert API alerts to AmiraMessage alerts
const mapApiAlertsToAmiraAlerts = (
  apiAlerts: ApiAlert[],
): Alert[] => apiAlerts.map(({
  id,
  title = '',
  studentId: studentIds = [],
  type,
  attentionLevel: urgency,
  groupedAlertIds: alertIds,
  contentType,
  ...otherFields // Preserve any additional fields like skillId, lessonPlanId, etc.
}) => ({
  id,
  title,
  alertIds,
  studentIds,
  urgency: urgency as AlertUrgency,
  type: type as AlertType,
  contentType: contentType as AlertContentType,
  ...otherFields // Include all other fields from the API
}));

export const AmiraMessageProvider: React.FC<{ children: React.ReactNode; initialCollapsed?: boolean }> = ({
  children,
  initialCollapsed = false
}) => {
  const CHAT_WIDGET_SELECTOR = '#amira-chatbot-widget'; // The primary chatbot container
  const CHAT_TOGGLE_SELECTOR = `${CHAT_WIDGET_SELECTOR} .acb-chat-toggle-button`; // The trigger for the chat open/close behavior
  const CHAT_CONTAINER_SELECTOR = `${CHAT_WIDGET_SELECTOR} .acb-chat-container`; // The container for the chat conversation

  const dispatch = useDispatch<AppDispatch>();
  const { alerts: alertsState } = useSelector(( state: RootState ) => state.alerts);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [justClosedModal, setJustClosedModal] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMute = localStorage.getItem('amiraMessagesMuted');
    return savedMute ? JSON.parse(savedMute) : false;
  });
  const [isCollapsed, setCollapsed] = useState(initialCollapsed);
  const accessToken = useAccessToken();
  const { classroomId } = useSelectedClassroom();

  useEffect(() => {
    const observer = new MutationObserver((_, obs) => {
      const toggleButton = document.querySelector(CHAT_TOGGLE_SELECTOR);
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          if (!isCollapsed && (document.querySelector(CHAT_CONTAINER_SELECTOR) as HTMLElement).style.display === 'none') setCollapsed(true);
        });
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isCollapsed]);

  // Fetch alerts from the API when the access token becomes available
  useEffect(() => {
    if (accessToken) {
      dispatch(getAlerts());
    }
  }, [dispatch, accessToken]);

  // Update local alerts when Redux store changes
  useEffect(() => {
    if (alertsState && Array.isArray(alertsState)) {
      setAlerts(mapApiAlertsToAmiraAlerts(alertsState));
    }
  }, [alertsState]);

  useEffect(() => {
    // Check if user has previously interacted with alerts
    const hasUserInteracted = sessionStorage.getItem('amira-alerts-user-interacted') === 'true';
    
    // Only auto-expand if user hasn't interacted with alerts before
    if (!initialCollapsed && !hasUserInteracted) {
      setCollapsed(alerts.length === 0);
    }

    // If the alerts are empty and expanded, collapse the alerts
    if (!isCollapsed && alerts.length === 0) {
      setCollapsed(true);
    }

    // If alerts are collapsed, and there is an AutoFix alert, then expand the alerts and set the active index to the AutoFix alert
    // If the user has already interacted with the AutoFix alert, then don't expand the alerts
    if (
      isCollapsed &&
      alerts.length > 0 &&
      alerts.some(
        alert =>
          alert.type === AlertType.LessonPlanAutoFix &&
          !sessionStorage.getItem("amira-autofix-alert-interacted")
      )
    ) {
      sessionStorage.setItem("amira-autofix-alert-interacted", "true");
      setCollapsed(false);
      setActiveIndex(
        alerts.findIndex(alert => alert.type === AlertType.LessonPlanAutoFix)
      );
    }
  }, [alerts, initialCollapsed, isCollapsed]);

  // Save mute preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('amiraMessagesMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  // useEffect(() => {
  //   if (classroomId) {
  //     dispatch(setActiveClassroom({ classroomId }));
  //   }
  // }, [dispatch, classroomId]);

  useEffect(() => {
    if (
      (activeIndex >= alerts.length && alerts.length > 0) ||
      (alerts.length === 0 && activeIndex !== 0)
    ) {
      setActiveIndex(0);
    } 
  }, [alerts, activeIndex]);

  const bindings = {
    alerts,
    isMuted,
    isCollapsed,
    activeIndex,
    isModalOpen,
    addAlert: (alert: Omit<Alert, 'id'>) => {
      const id = Date.now().toString();
      // If the alert is a LessonPlanAutoFix, then we need to add it to the beginning of the alerts array
      if (alert.type === AlertType.LessonPlanAutoFix) {
        setAlerts(prevAlerts => {       
          const newAlerts = [...prevAlerts];
          newAlerts.splice(0, 0 , { ...alert, id });
          return newAlerts;
        });
        setActiveIndex(0);
      } else {
        setAlerts(prevAlerts => [...prevAlerts, { ...alert, id }]);
      }
      return id;
    },
    clearAllAlerts: () => {
      // Only archive server alerts
      alerts.forEach(alert => {
        // if (!/^\d+$/.test(alert.id) && !alert.id.includes('_AUTO_FIX')) {
        //   dispatch(archiveAlert({ alertId: alert.id }));
        // }
      });
      setCollapsed(true);
      setAlerts([]);
      setActiveIndex(0);
    },
    onDismiss: (id: string) => {
      // Mark that user has interacted with alerts to prevent auto-opening
      sessionStorage.setItem('amira-alerts-user-interacted', 'true');
      
      // If modal is open when dismissing, close it completely
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
      // Find the alert being dismissed to access its individual alert IDs
      const alertBeingDismissed = alerts.find(alert => alert.id === id);
      
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      
      // Archive all individual alert IDs within this grouped alert
      if (alertBeingDismissed) {
        
        alertBeingDismissed.alertIds.forEach(individualAlertId => {
          // Only archive server alerts, not local alerts
          // if (!/^\d+$/.test(individualAlertId) && !individualAlertId.includes('_AUTO_FIX')) {
          //   dispatch(archiveAlert({ alertId: individualAlertId }));
          // }
        });
      }
    },
    onDismissAllOfType: (alertType: AlertType) => {
      // Mark that user has interacted with alerts to prevent auto-opening
      sessionStorage.setItem('amira-alerts-user-interacted', 'true');
      
      // If modal is open when dismissing, close it completely
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
      // Find all alerts of the specified type
      const alertsOfType = alerts.filter(alert => alert.type === alertType);   
      
      // Archive server alerts before removing from state
      alertsOfType.forEach(alert => {        
        // Archive all individual alert IDs within this grouped alert
        alert.alertIds.forEach(individualAlertId => {
          // Only archive server alerts, not local alerts
          // if (!/^\d+$/.test(individualAlertId) && !individualAlertId.includes('_AUTO_FIX')) {
          //   dispatch(archiveAlert({ alertId: individualAlertId }));
          // }
        });
      });
      
             // Remove all alerts of this type from local state
       setAlerts(prevAlerts => {
         const newAlerts = prevAlerts.filter(alert => alert.type !== alertType);
         return newAlerts;
       });
     },
     onRemoveStudentFromAlert: (alertId: string, studentId: number) => {
       
       // Mark that user has interacted with alerts to prevent auto-opening
       sessionStorage.setItem('amira-alerts-user-interacted', 'true');
       
       // Close the main alert modal to prevent it from reopening
       if (isModalOpen) {
         setIsModalOpen(false);
       }
       
       setAlerts(prevAlerts => {
         return prevAlerts.map(alert => {
           if (alert.id === alertId) {
             // Remove the specific student from this alert
             const updatedStudentIds = alert.studentIds.filter(id => id !== studentId);
             
             // If no students left, remove the entire alert
             if (updatedStudentIds.length === 0) {
               // Archive the alert before removing it
               alert.alertIds.forEach(individualAlertId => {
                //  if (!/^\d+$/.test(individualAlertId) && !individualAlertId.includes('_AUTO_FIX')) {
                //    dispatch(archiveAlert({ alertId: individualAlertId }));
                //  }
               });
               return null; // Mark for removal
             }
             
             // Return updated alert with fewer students
             return { ...alert, studentIds: updatedStudentIds };
           }
           return alert;
         }).filter((alert): alert is Alert => alert !== null); // Remove null entries
       });
     },
    onMute: () => setIsMuted(prev => !prev),
    onSnooze: (id: string) => {
      // Mark that user has interacted with alerts to prevent auto-opening
      sessionStorage.setItem('amira-alerts-user-interacted', 'true');
      
      // If modal is open when snoozing, close it completely
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
      // Handle active index updates when snoozing alerts
      const snoozedIndex = alerts.findIndex(alert => alert.id === id);
      if (
        snoozedIndex <= activeIndex
        && alerts.length > 1
        && (
          activeIndex === alerts.length - 1
          || snoozedIndex < activeIndex
        )
      ) {
        setActiveIndex(activeIndex - 1);
      }
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      // dispatch(snoozeAlert({ alertId: id }));
    },
    onSlideChange: (index: number) => setActiveIndex(index),
    onToggleCollapse: (collapsed: boolean) => {
      // Mark that user has interacted with alerts when manually collapsing
      if (collapsed) {
        sessionStorage.setItem('amira-alerts-user-interacted', 'true');
      }
      
      const chatContainer = document.querySelector(CHAT_CONTAINER_SELECTOR) as HTMLElement;
      const chatTrigger = document.querySelector(CHAT_TOGGLE_SELECTOR) as HTMLElement;
      if (!collapsed && chatContainer?.style.display === 'block') chatTrigger.click();
      setCollapsed(collapsed)
    },
    onToggleModal: (open: boolean) => setIsModalOpen(open),
  };

  return (
    <Speech config={{}}>
      {(props: any, transcriptInfo: any) => (
      <AmiraAlertContext.Provider value={{...bindings, speechProps: props, transcriptInfo}}>
        {children} 
        <AmiraMessage />
      </AmiraAlertContext.Provider>)}
    </Speech>
  );
};

export const useAmiraMessage = (): AmiraAlertContextType => {
  const context = useContext(AmiraAlertContext);
  if (context === undefined) {
    throw new Error('useAmiraMessage must be used within an AmiraMessageProvider');
  }
  return context;
};