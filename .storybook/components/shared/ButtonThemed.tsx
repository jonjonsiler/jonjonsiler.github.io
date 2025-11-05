import React from "react";
import { Loading } from "@components/global";
import type { StatusVariant } from "@models";

export interface ButtonThemedProps {
  label?: string | null;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  variant?: StatusVariant | "primary" | "secondary" | "light" | "dark" | "link";
  style?: React.CSSProperties;
  loading?: boolean;
}

const disabledStyle = {
  borderColor: "#DDE1E9",
  backgroundColor: "#DDE1E9",
  color: "#3C3C3C",
};

export const ButtonThemed: React.FC<ButtonThemedProps> = ({
  label,
  onClick,
  className,
  variant = "primary",
  children,
  disabled = false,
  style,
  loading = false,
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ height: 24 }}>
          <Loading />
        </div>
      );
    }
    if (children) {
      return children;
    }
    return null;
  };

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className ? className : ""}`}
      onClick={onClick}
      {...(disabled ? { disabled: disabled || loading } : {})}
      {...(label ? { "aria-label": label } : {})}
      style={disabled || loading ? disabledStyle : style}>
      {renderContent()}
    </button>
  );
};