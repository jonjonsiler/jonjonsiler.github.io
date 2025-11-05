import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import Notifications, {
  makeToast,
  TOAST_MESSAGE_ID,
  ToastTypes,
} from "@components/global/Notifications/Notifications";
import "/src/styles/global-app.scss";
import "/.storybook/storybook-override-styles.scss";

export default {
  component: Notifications,
  title: "Utils/Notifications",
  tags: ["autodocs"],
};

export const Default = (args) => {
  return (
    <div>
      <Notifications filterDuplicates={false} />
      <button onClick={() => toast("Hello World!")}>Add Toast</button>
    </div>
  );
};

export const FilteredDuplicates = (args) => {
  return (
    <div>
      <Notifications filterDuplicates={true} />
      <button onClick={() => toast("Hello World!")}>Add Toast 1</button>
      <button onClick={() => toast("Hello World!!!")}>Add Toast 2</button>
    </div>
  );
};

export const EmojiToasts = (args) => {
  const showCustomToast = (isSuccess) => {
    const toastId = toast.custom(
      (t) => (
        <div>
          <span
            style={{
              filter: "brightness(500%)",
              background: isSuccess ? "green" : "red",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              position: "relative",
              display: "inline-block",
              textAlign: "center", // Center the emoji within the circle
              lineHeight: "24px",
              fontSize: isSuccess ? "1rem" : "0.7rem",
              marginRight: "0.5rem",
            }}
          >
            {isSuccess ? "✔" : "✖️"}
          </span>
          <span id={TOAST_MESSAGE_ID}>
            {isSuccess ? "Operation was successful!" : "Operation has Failed!"}
          </span>
        </div>
      ),
      {
        duration: 30000,
        className: isSuccess
          ? "alert amira-alert-success aec-notify-toast-success"
          : "alert amira-alert-warning aec-notify-toast-warning",
      }
    );
  };

  return (
    <div>
      <Notifications />
      <p>
        NOTE: custom toasts filter duplicates by contents of element with id: `
        {TOAST_MESSAGE_ID}`.
      </p>
      <p>
        Example:{`<span id="${TOAST_MESSAGE_ID}">Operation was successful!</span>`}
      </p>
      <button onClick={() => showCustomToast(true)}>Add Success Toast</button>
      <button onClick={() => showCustomToast(false)}>Add Danger Toast</button>
    </div>
  );
};

export const MakeToast = (args) => {
  return (
    <div>
      <Notifications filterDuplicates={true} />
      <div className="d-flex flex-column">
        <button
          onClick={() =>
            makeToast(
              "An assessment has been scheduled for 11 students.",
              ToastTypes.success,
              true,
              3000,
              () => console.log("SUCCESS ALERT PRESSED!"),
              () => console.log("DISMISS SUCCESS ALERT PRESSED!")
            )
          }
        >
          Add Dismissable Success Toast
        </button>
        <button
          onClick={() =>
            makeToast(
              "Something went wrong. Your assessment wasn’t created. Try again.",
              ToastTypes.warning,
              true,
              3000,
              () => console.log("WARNING PRESSED!"),
              () => console.log("DISMISS WARNING ALERT PRESSED!")
            )
          }
        >
          Add Dismissable Warning Toast
        </button>
        <button
          onClick={() =>
            makeToast(
              "An assessment has been scheduled for 11 students.",
              ToastTypes.success,
              false,
              300000,
              () => console.log("SUCCESS ALERT PRESSED!"),
              () => console.log("DISMISS SUCCESS ALERT PRESSED!")
            )
          }
        >
          Add NON-Dismissable Success Toast
        </button>
        <button
          onClick={() =>
            makeToast(
              "Something went wrong. Your assessment wasn’t created. Try again.",
              ToastTypes.warning,
              false,
              3000,
              () => console.log("WARNING PRESSED!"),
              () => console.log("DISMISS WARNING ALERT PRESSED!")
            )
          }
        >
          Add NON-Dismissable Warning Toast
        </button>
        <button
          onClick={() =>
            makeToast(
              "I am a primary notification and look at me go!",
              ToastTypes.default,
              true,
              3000,
              () => console.log("PRIMARY PRESSED!"),
              () => console.log("DISMISS PRIMARY ALERT PRESSED!")
            )
          }
        >
          Add Dismissable Primary Toast
        </button>
      </div>
    </div>
  );
};
