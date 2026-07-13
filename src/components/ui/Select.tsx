import type { ComponentPropsWithRef, ReactNode } from "react";
import { fieldClass, fieldErrorClass, helperTextClass, labelClass } from "./formStyles";

interface SelectProps extends ComponentPropsWithRef<"select"> {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function Select({ id, label, hideLabel = false, hint, error, children, ...rest }: SelectProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : labelClass}>
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={fieldClass}
        {...rest}
      >
        {children}
      </select>
      {hint && (
        <p id={hintId} className={helperTextClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className={fieldErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}
