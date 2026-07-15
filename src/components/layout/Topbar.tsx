import type { RefObject } from "react";
import { LogOut, Menu, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
  menuExpanded: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  sidebarCollapsed: boolean;
}

export function Topbar({
  onMenuClick,
  menuExpanded,
  menuButtonRef,
  sidebarCollapsed,
}: TopbarProps) {
  const { usuario, logout } = useAuth();

  return (
    <header className="app-topbar relative z-40 flex min-h-16 shrink-0 items-stretch border-b border-border bg-surface">
      <div className="flex min-w-0 items-center gap-1 px-2 md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-body transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
          aria-label="Abrir menu"
          aria-controls="mobile-sidebar"
          aria-expanded={menuExpanded}
        >
          <Menu aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
        </button>

        <Link
          to="/"
          aria-label="Ir para o dashboard"
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-md px-2 text-ink transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar text-sidebar-text-strong">
            <PackageCheck aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="truncate text-base font-semibold">Meu Inventário</span>
        </Link>
      </div>

      <div
        className={`hidden shrink-0 items-center transition-[width] duration-200 ease-out md:flex motion-reduce:transition-none ${
          sidebarCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <Link
          to="/"
          aria-label="Ir para o dashboard"
          title={sidebarCollapsed ? "Meu Inventário" : undefined}
          className={`flex min-h-11 w-full items-center rounded-md text-ink transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-inset motion-reduce:transition-none ${
            sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar text-sidebar-text-strong">
            <PackageCheck aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </span>
          {!sidebarCollapsed && <span className="truncate text-lg font-semibold">Meu Inventário</span>}
        </Link>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 md:px-6">
        <div className="hidden min-w-0 text-right sm:block">
          <p className="max-w-[min(12rem,40vw)] truncate text-sm font-medium text-ink" title={usuario?.nome}>
            {usuario?.nome}
          </p>
          <p className="text-xs text-muted">{usuario?.papel === "admin" ? "Administrador" : "Funcionário"}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout().catch(() => undefined)}
          aria-label="Sair da conta"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md border border-control-border px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          <LogOut aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
