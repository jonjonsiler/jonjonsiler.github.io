import type { ToastType } from "@enums";

export interface ToastState {
  activeToast: {
    type: ToastType;
    message: string;
    timestamp: number;
  } | null;
}