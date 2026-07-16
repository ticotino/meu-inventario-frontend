import type { ComponentPropsWithRef } from "react";
import { fieldClass, fieldErrorClass, helperTextClass, labelClass } from "./formStyles";

interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ id, label, hint, error, rows = 3, ...rest }: TextareaProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {rest.required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          </>
        )}
      </label>
      <textarea
        id={id}
        rows={rows}
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
