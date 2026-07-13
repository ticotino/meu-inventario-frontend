import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClasses } from "./formStyles";
import type { ButtonVariant } from "./formStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  loadingText,
  fullWidth = false,
  type = "button",
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${buttonClasses(variant, fullWidth)}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}
