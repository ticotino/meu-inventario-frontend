import type { ReactNode } from "react";
import { feedbackSuccessClass } from "./formStyles";

interface SuccessBannerProps {
  children: ReactNode;
}

export function SuccessBanner({ children }: SuccessBannerProps) {
  return (
    <p role="status" aria-live="polite" className={feedbackSuccessClass}>
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 12 4 4L19 6" />
      </svg>
      <span className="flex-1">{children}</span>
    </p>
  );
}
