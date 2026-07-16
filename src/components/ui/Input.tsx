import type { ComponentPropsWithRef, ReactNode } from "react";
import { fieldClass, fieldErrorClass, helperTextClass, labelClass } from "./formStyles";

interface InputProps extends ComponentPropsWithRef<"input"> {
  id: string;
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
  endAdornment?: ReactNode;
}

export function Input({
  id,
  label,
  hideLabel = false,
  hint,
  error,
  endAdornment,
  className,
  ...rest
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const inputClassName = `${fieldClass}${endAdornment ? " pr-12" : ""}${className ? ` ${className}` : ""}`;

  const input = (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={inputClassName}
      {...rest}
    />
  );

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : labelClass}>
        {label}
        {rest.required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          </>
        )}
      </label>
      {endAdornment ? (
        <div className="relative">
          {input}
          <div className="absolute bottom-0 right-0 flex min-h-11 items-center">{endAdornment}</div>
        </div>
      ) : (
        input
      )}
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
