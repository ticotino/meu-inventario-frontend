import type { RefObject } from "react";
import { useAuth } from "../../hooks/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
  menuExpanded: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function Topbar({ onMenuClick, menuExpanded, menuButtonRef }: TopbarProps) {
  const { usuario, logout } = useAuth();

  return (
    <header className="app-topbar flex min-h-16 items-center border-b border-border bg-surface px-4 py-2 md:px-6">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuClick}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-body transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none md:hidden"
        aria-label="Abrir menu"
        aria-controls="mobile-sidebar"
        aria-expanded={menuExpanded}
      >
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="min-w-0 text-right">
          <p className="max-w-[min(12rem,40vw)] truncate text-sm font-medium text-ink" title={usuario?.nome}>
            {usuario?.nome}
          </p>
          <p className="text-xs text-muted">{usuario?.papel === "admin" ? "Administrador" : "Funcionário"}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout().catch(() => undefined)}
          className="min-h-11 shrink-0 rounded-md border border-control-border px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
