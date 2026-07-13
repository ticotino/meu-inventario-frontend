export const fieldClass =
  "mt-1 min-h-11 w-full rounded-md border border-control-border bg-surface px-3 py-2 text-base text-ink transition-colors placeholder:text-muted focus:border-action focus:outline-none focus:ring-2 focus:ring-action/25 motion-reduce:transition-none sm:text-sm";

export const labelClass = "block text-sm font-medium text-body";
export const helperTextClass = "mt-1 text-xs text-muted";
export const fieldErrorClass = "mt-1 text-xs text-danger";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "ghost-danger";

const buttonBaseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-surface hover:bg-action-hover active:bg-action-hover",
  secondary: "border border-control-border bg-surface text-body hover:bg-page active:bg-page",
  // text-danger-strong (não text-danger): text-danger sobre bg-danger-bg no
  // hover/active só fecha 4.41:1, abaixo do mínimo AA de 4.5:1.
  danger: "border border-control-border bg-surface text-danger-strong hover:bg-danger-bg active:bg-danger-bg",
  ghost: "min-h-9 px-2 py-1 font-medium text-action hover:bg-page active:bg-page",
  "ghost-danger": "min-h-9 px-2 py-1 font-medium text-danger-strong hover:bg-danger-bg active:bg-danger-bg",
};

export function buttonClasses(variant: ButtonVariant = "primary", fullWidth = false): string {
  return `${buttonBaseClasses} ${buttonVariantClasses[variant]}${fullWidth ? " w-full" : ""}`;
}

export const feedbackErrorClass = "rounded-md bg-danger-bg px-3 py-2 text-sm text-danger-strong";
export const feedbackSuccessClass =
  "flex items-start gap-2 rounded-md bg-success-bg px-3 py-2 text-sm text-success";
