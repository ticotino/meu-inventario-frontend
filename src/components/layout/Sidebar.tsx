import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
}

const LINKS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/materias-primas", label: "Matérias-primas" },
  { to: "/producao", label: "Produção" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/romaneios", label: "Romaneios" },
  { to: "/fabricantes", label: "Fabricantes" },
];

const ADMIN_LINKS: NavItem[] = [{ to: "/usuarios/novo", label: "Novo usuário" }];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

interface SidebarContentProps {
  links: NavItem[];
  titleId: string;
  onNavigate?: () => void;
  onClose?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
}

function SidebarContent({ links, titleId, onNavigate, onClose, closeButtonRef }: SidebarContentProps) {
  return (
    <>
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
        <div id={titleId} className="min-w-0 px-2 text-lg font-semibold tracking-tight text-sidebar-text-strong">
          Meu Inventário
        </div>
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none"
            aria-label="Fechar menu"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav aria-label="Navegação principal" className="flex flex-col gap-1 px-3 pb-5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
                isActive ? "bg-action text-surface" : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-strong"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function Sidebar({ open, onClose, triggerRef }: SidebarProps) {
  const { usuario } = useAuth();
  const links = usuario?.papel === "admin" ? [...LINKS, ...ADMIN_LINKS] : LINKS;
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // O drawer só existe em telas < md (some via `md:hidden`); se a viewport
    // cruzar para desktop enquanto `open` continua true (ex.: rotação de
    // tablet), libera o scroll-lock e o focus-trap, que ficariam presos.
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) onClose();
    }
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
      triggerElement?.focus();
    };
  }, [onClose, open, triggerRef]);

  return (
    <>
      <aside aria-labelledby="desktop-sidebar-title" className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-text md:flex">
        <SidebarContent links={links} titleId="desktop-sidebar-title" />
      </aside>

      {open && (
        <>
          <div className="fixed inset-0 z-20 bg-sidebar/40 md:hidden" onClick={onClose} aria-hidden="true" />
          <aside
            ref={drawerRef}
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sidebar-title"
            className="mobile-sidebar fixed inset-y-0 left-0 z-30 flex w-64 max-w-[calc(100vw-3rem)] flex-col overflow-y-auto bg-sidebar text-sidebar-text md:hidden"
          >
            <SidebarContent
              links={links}
              titleId="mobile-sidebar-title"
              onNavigate={onClose}
              onClose={onClose}
              closeButtonRef={closeButtonRef}
            />
          </aside>
        </>
      )}
    </>
  );
}
