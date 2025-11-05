import type { ButtonActionHandler, ButtonSizeVariant, StatusVariant} from "@models";

export interface ButtonVariant {
  label: string,
  handler: ButtonActionHandler,
  variant: StatusVariant,
  size: ButtonSizeVariant,
}