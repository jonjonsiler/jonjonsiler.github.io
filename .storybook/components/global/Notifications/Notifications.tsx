import React from "react";
import toast, { useToaster } from "react-hot-toast";
import { getI18n } from "react-i18next";
// import { useDispatch } from "react-redux";

import "./Notifications.scss";
import { findContentById } from "@utilities";
// import { showToast, clearActiveToast, ToastType } from "@/store/slices/ToastSlice";
import { ToastType } from "@enums";
// import { store } from "@/store";

import bellIcon from "/images/alerts/bell.svg";
import checkmarkIcon from "/images/alerts/checkmark.svg";
import warningIcon from "/images/alerts/warning.svg";

export const TOAST_MESSAGE_ID = "toast-message";

export enum ToastTypes {
  default,
  success,
  warning,
}

// Map internal toast types to redux store types
// const mapToastType = (toastType: ToastTypes): ToastType => {
//   switch (toastType) {
//     case ToastTypes.success:
//       return ToastType.Success;
//     case ToastTypes.warning:
//       return ToastType.Warning;
//     default:
//       return ToastType.Default;
//   }
// };

export const makeToast = (
  message: string,
  toastType: ToastTypes = ToastTypes.default,
  dismissible: boolean = true,
  duration: number = 3000,
  onAlertPress?: () => void,
  onDismiss?: () => void
) => {
  // store.dispatch(showToast({
  //   type: mapToastType(toastType),
  //   message
  // }));

  let classes = "alert";
  let icon = "";
  switch (toastType) {
    case ToastTypes.success:
      classes += " amira-alert-success aec-notify-toast-success";
      icon = checkmarkIcon;
      break;
    case ToastTypes.warning:
      classes += " amira-alert-warning aec-notify-toast-warning";
      icon = warningIcon;
      break;
    default:
      classes += " amira-alert-primary aec-notify-toast-primary";
      icon = bellIcon;
      break;
  }

  const contents = (
    <span className="d-flex justify-content-center align-items-center gap-3">
      {icon && (
        <div>
          <img role="presentation" src={icon} />
        </div>
      )}
      <p className="m-0" id={TOAST_MESSAGE_ID}>{message}</p>
    </span>
  );

  let toastId = '';

  const dismissHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    toast.dismiss(toastId);
    // store.dispatch(clearActiveToast());
    if (onDismiss !== undefined) onDismiss();
  }

  toastId = toast.custom(
    (t) => (
      <div data-testid="aec-alert" onClick={onAlertPress}>
        <div className="d-flex flex-column w-100 gap-3 align-items-start amira-alert-content">
          {contents}
          {dismissible && (
            <button
              className="align-self-flex-end amira-alert-dismiss"
              onClick={dismissHandler}
            >
              {getI18n().t('dismiss')}
            </button>
          )}
        </div>
      </div>
    ),
    {
      duration: duration,
      className: classes,
    }
  );
  if (duration !== Infinity) {
    setTimeout(() => {
      // Use the imported store
      // store.dispatch(clearActiveToast());
    }, duration);
  }
};

export interface NotificationsProps {
  filterDuplicates?: boolean;
}
const Notifications: React.FC<NotificationsProps> = ({
  filterDuplicates = true,
}) => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, updateHeight } = handlers;
  const uniqueMessages = new Set<string>();

  let shownToasts = [...toasts];
  if (filterDuplicates) {
    shownToasts = toasts.filter(({ id, message, visible, type }) => {
      const isJSX = type === "custom";
      if (message) {
        let uniqueMessage = "";
        if (isJSX) {
          // Look for el id `toast-message` content to compare message text within JSX content
          if (typeof message === 'function') {
            const val = (message as any)();
            if (val && val.props && val.props.children) {
              const content = findContentById(val, TOAST_MESSAGE_ID);
              uniqueMessage = !uniqueMessages.has(`${content}`)
                ? `${content}`
                : "";

              // could not find TOAST_MESSAGE_ID so include in the shown toasts array
              if (!content) {
                return true;
              }
            }
          } else {
            // message is not a function, treat as regular message
            uniqueMessage = !uniqueMessages.has(`${message}`) ? `${message}` : "";
          }
        } else {
          // content came in as a string message
          uniqueMessage = !uniqueMessages.has(`${message}`) ? `${message}` : "";
        }

        if (uniqueMessage) {
          uniqueMessages.add(`${uniqueMessage}`);
          return true; // Include the toast if it's unique
        }
      }

      if (visible) {
        toast.dismiss(id);
      }
      return false; // Exclude the toast if it's a duplicate
    });
  }

  let cumulativeOffset = 0;

  return (
    <div
      data-testid="aec-notifications"
      className="aec-notify-bottom-middle"
      onMouseEnter={startPause}
      onMouseLeave={endPause}
    >
      {shownToasts.map(
        ({ type, height, id, visible, ariaProps, message, className }) => {
          const isJSX = type === "custom";
          const offset = cumulativeOffset;
          cumulativeOffset += (height || 0) + 8;
          const ref = (el: HTMLDivElement) => {
            if (el && typeof height !== "number") {
              const height = el.getBoundingClientRect().height;
              updateHeight(id, height);
            }
          };
          return (
            <div
              key={id}
              ref={ref}
              className={`aec-notify-toast ${className ? className : "aec-notify-toast-default-bg"}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: `translateY(${-offset}px)`,
              }}
              {...ariaProps}
            >
              {isJSX ? (typeof message === 'function' ? (message as any)() : message) : message}
            </div>
          );
        }
      )}
    </div>
  );
};