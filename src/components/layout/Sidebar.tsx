import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Search,
  ShoppingCart,
  Truck,
  UserCog,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Visão geral",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Estoque",
    items: [
      { to: "/materias-primas", label: "Matérias-primas", icon: Boxes },
      { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
      { to: "/compras", label: "Compras", icon: ShoppingCart },
      { to: "/fabricantes", label: "Fabricantes", icon: Building2 },
    ],
  },
  {
    label: "Operação",
    items: [
      { to: "/producao", label: "Produção", icon: Factory },
      { to: "/pedidos", label: "Pedidos", icon: ClipboardList },
      { to: "/romaneios", label: "Romaneios", icon: Truck },
    ],
  },
  {
    label: "Gestão",
    items: [{ to: "/relatorios", label: "Relatórios", icon: BarChart3 }],
  },
];

const ADMIN_GROUP: NavGroup = {
  label: "Administração",
  items: [{ to: "/usuarios/novo", label: "Gerenciar acessos", icon: UserCog }],
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onExpand: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  desktopToggleRef: RefObject<HTMLButtonElement | null>;
}

interface SidebarContentProps {
  groups: NavGroup[];
  titleId: string;
  searchId: string;
  query: string;
  collapsed?: boolean;
  onQueryChange: (value: string) => void;
  onSearchWhileCollapsed?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

function SidebarContent({
  groups,
  titleId,
  searchId,
  query,
  collapsed = false,
  onQueryChange,
  onSearchWhileCollapsed,
  onNavigate,
  onClose,
  closeButtonRef,
  searchInputRef,
}: SidebarContentProps) {
  const normalizedQuery = normalizeSearch(query);
  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => normalizeSearch(item.label).includes(normalizedQuery)),
        }))
        .filter((group) => group.items.length > 0),
    [groups, normalizedQuery],
  );

  return (
    <>
      {onClose ? (
        <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 px-3 py-2">
          <h2 id={titleId} className="px-1 text-base font-semibold text-sidebar-text-strong">
            Navegação
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none"
            aria-label="Fechar menu"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <h2 id={titleId} className="sr-only">
          Navegação principal
        </h2>
      )}

      <div className={`shrink-0 px-3 pb-3 pt-1 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={onSearchWhileCollapsed}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none"
            aria-label="Expandir menu e buscar uma seção"
            title="Buscar seção"
          >
            <Search aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : (
          <div className="relative">
            <label className="sr-only" htmlFor={searchId}>
              Buscar seção
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-text"
              strokeWidth={2}
            />
            <input
              ref={searchInputRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar seção"
              autoComplete="off"
              className="min-h-11 w-full rounded-md border border-sidebar-text/40 bg-sidebar-hover py-2 pl-10 pr-3 text-sm text-sidebar-text-strong placeholder:text-sidebar-text transition-colors hover:border-sidebar-text/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 focus:ring-offset-sidebar motion-reduce:transition-none"
            />
          </div>
        )}
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-5"
      >
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h2 className={collapsed ? "sr-only" : "px-3 pb-1 text-xs font-medium text-sidebar-text"}>
              {group.label}
            </h2>
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onNavigate}
                  aria-label={collapsed ? item.label : undefined}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center rounded-md py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
                      collapsed ? "justify-center px-2" : "gap-3 px-3"
                    } ${
                      isActive
                        ? "bg-action text-surface"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-strong"
                    }`
                  }
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}

        {filteredGroups.length === 0 && !collapsed && (
          <div
            className="rounded-md border border-sidebar-text/40 px-3 py-4 text-sm text-sidebar-text"
            role="status"
          >
            <p>Nenhuma seção encontrada.</p>
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="mt-2 min-h-11 rounded-md px-2 py-2 font-medium text-sidebar-text-strong underline decoration-sidebar-text underline-offset-4 transition-colors hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none"
            >
              Limpar busca
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export function Sidebar({ open, collapsed, onClose, onExpand, triggerRef, desktopToggleRef }: SidebarProps) {
  const { usuario } = useAuth();
  const groups = useMemo(
    () => (usuario?.papel === "admin" ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS),
    [usuario?.papel],
  );
  const [query, setQuery] = useState("");
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const shouldFocusSearchRef = useRef(false);

  function handleSearchWhileCollapsed() {
    shouldFocusSearchRef.current = true;
    onExpand();
  }

  useEffect(() => {
    if (!collapsed && shouldFocusSearchRef.current) {
      shouldFocusSearchRef.current = false;
      desktopSearchRef.current?.focus();
    }
  }, [collapsed]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;
    let shouldRestoreTriggerFocus = true;
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
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    function focusDesktopToggle() {
      window.requestAnimationFrame(() => {
        const focusTarget = desktopToggleRef.current ?? document.querySelector<HTMLElement>("main");
        focusTarget?.focus();
      });
    }

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        shouldRestoreTriggerFocus = false;
        onClose();
        focusDesktopToggle();
      }
    }
    mediaQuery.addEventListener("change", handleViewportChange);

    if (mediaQuery.matches) {
      shouldRestoreTriggerFocus = false;
      onClose();
      focusDesktopToggle();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
      if (shouldRestoreTriggerFocus) triggerElement?.focus();
    };
  }, [desktopToggleRef, onClose, open, triggerRef]);

  return (
    <>
      <aside
        id="desktop-sidebar"
        aria-labelledby="desktop-sidebar-title"
        className={`hidden h-full min-h-0 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-text transition-[width] duration-200 ease-out md:flex motion-reduce:transition-none ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <SidebarContent
          groups={groups}
          titleId="desktop-sidebar-title"
          searchId="desktop-sidebar-search"
          query={query}
          collapsed={collapsed}
          onQueryChange={setQuery}
          onSearchWhileCollapsed={handleSearchWhileCollapsed}
          searchInputRef={desktopSearchRef}
        />
      </aside>

      {open && (
        <>
          <div
            className="absolute inset-0 z-20 bg-sidebar/40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            ref={drawerRef}
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sidebar-title"
            className="mobile-sidebar absolute inset-y-0 left-0 z-30 flex w-64 max-w-[calc(100vw-3rem)] flex-col overflow-hidden bg-sidebar text-sidebar-text md:hidden"
          >
            <SidebarContent
              groups={groups}
              titleId="mobile-sidebar-title"
              searchId="mobile-sidebar-search"
              query={query}
              onQueryChange={setQuery}
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
