interface PasswordVisibilityButtonProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordVisibilityButton({ visible, onToggle }: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-body transition-colors hover:bg-page active:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
      aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      aria-pressed={visible}
    >
      {visible ? (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 8.5 4.5 9 6.2a2.8 2.8 0 0 1 0 1.6 11 11 0 0 1-2.1 3.4M6.6 6.7A12 12 0 0 0 3 10.2a2.8 2.8 0 0 0 0 1.6C3.5 13.5 7 18 12 18c.8 0 1.5-.1 2.2-.3" />
        </svg>
      ) : (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" strokeWidth={2} />
        </svg>
      )}
    </button>
  );
}
