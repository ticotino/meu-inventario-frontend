import type { ComponentPropsWithRef, ReactNode } from "react";
import { fieldClass, fieldErrorClass, helperTextClass, labelClass } from "./formStyles";

interface InputProps extends ComponentPropsWithRef<"input"> {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
}

export function Input({ id, label, hideLabel = false, hint, error, ...rest }: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : labelClass}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={fieldClass}
        {...rest}
      />
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
