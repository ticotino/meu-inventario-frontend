import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, MouseEvent, PointerEvent, RefObject } from "react";
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
import { NavLink, useLocation } from "react-router-dom";
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

const PREVIEW_OPEN_DELAY = 100;
const PREVIEW_CLOSE_DELAY = 150;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function filterGroups(groups: NavGroup[], query: string) {
  const normalizedQuery = normalizeSearch(query);

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => normalizeSearch(item.label).includes(normalizedQuery)),
    }))
    .filter((group) => group.items.length > 0);
}

function isCurrentItem(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  desktopFirstControlRef: RefObject<HTMLButtonElement | null>;
}

interface MobileSidebarContentProps {
  groups: NavGroup[];
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: () => void;
  onClose: () => void;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}

function MobileSidebarContent({
  groups,
  query,
  onQueryChange,
  onNavigate,
  onClose,
  closeButtonRef,
}: MobileSidebarContentProps) {
  const filteredGroups = useMemo(() => filterGroups(groups, query), [groups, query]);

  return (
    <>
      <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 px-3 py-2">
        <h2 id="mobile-sidebar-title" className="px-1 text-base font-semibold text-sidebar-text-strong">
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

      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className="relative">
          <label className="sr-only" htmlFor="mobile-sidebar-search">
            Buscar seção
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-text"
            strokeWidth={2}
          />
          <input
            id="mobile-sidebar-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar seção"
            autoComplete="off"
            className="min-h-11 w-full rounded-md border border-sidebar-text/40 bg-sidebar-hover py-2 pl-10 pr-3 text-sm text-sidebar-text-strong placeholder:text-sidebar-text transition-colors hover:border-sidebar-text/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 focus:ring-offset-sidebar motion-reduce:transition-none"
          />
        </div>
      </div>

      <nav aria-label="Navegação principal" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-5">
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h2 className="px-3 pb-1 text-xs font-medium text-sidebar-text">{group.label}</h2>
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
                      isActive
                        ? "bg-action text-surface"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-strong"
                    }`
                  }
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="rounded-md border border-sidebar-text/40 px-3 py-4 text-sm text-sidebar-text" role="status">
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

interface DesktopSidebarContentProps {
  groups: NavGroup[];
  expanded: boolean;
  pinned: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onTogglePinned: (event: MouseEvent<HTMLButtonElement>) => void;
  onPinAndSearch: () => void;
  firstControlRef: RefObject<HTMLButtonElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onIconFocus: (element: HTMLButtonElement) => void;
}

function DesktopSidebarContent({
  groups,
  expanded,
  pinned,
  query,
  onQueryChange,
  onTogglePinned,
  onPinAndSearch,
  firstControlRef,
  searchInputRef,
  onIconFocus,
}: DesktopSidebarContentProps) {
  const { pathname } = useLocation();
  const filteredGroups = useMemo(() => filterGroups(groups, query), [groups, query]);

  return (
    <>
      <h2 id="desktop-sidebar-title" className="sr-only">
        Navegação principal
      </h2>

      <div className={`shrink-0 px-3 pb-3 pt-3 ${expanded ? "" : "flex justify-center"}`}>
        <div className={expanded ? "relative w-full" : "relative"}>
          <button
            ref={firstControlRef}
            type="button"
            onClick={onPinAndSearch}
            onFocus={(event) => onIconFocus(event.currentTarget)}
            className={`z-10 flex min-h-11 min-w-11 items-center justify-center rounded-md text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-sidebar-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
              expanded ? "absolute left-0 top-0" : ""
            }`}
            aria-controls="desktop-sidebar"
            aria-expanded={expanded}
            aria-label={pinned ? "Focar busca de seções" : "Fixar menu aberto e buscar uma seção"}
            title={expanded ? undefined : "Buscar seção"}
          >
            <Search aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          </button>

          {expanded && (
            <>
              <label className="sr-only" htmlFor="desktop-sidebar-search">
                Buscar seção
              </label>
              <input
                ref={searchInputRef}
                id="desktop-sidebar-search"
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Buscar seção"
                autoComplete="off"
                className="min-h-11 w-full rounded-md border border-sidebar-text/40 bg-sidebar-hover py-2 pl-11 pr-3 text-sm text-sidebar-text-strong placeholder:text-sidebar-text transition-colors hover:border-sidebar-text/60 focus:border-action focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 focus:ring-offset-sidebar motion-reduce:transition-none"
              />
            </>
          )}
        </div>
      </div>

      <nav aria-label="Navegação principal" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-5">
        {filteredGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h2 className={expanded ? "px-3 pb-1 text-xs font-medium text-sidebar-text" : "sr-only"}>{group.label}</h2>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentItem(pathname, item.to);

              return (
                <div key={item.to} className={`flex min-h-11 items-stretch ${expanded ? "gap-1" : "justify-center"}`}>
                  <button
                    type="button"
                    onClick={onTogglePinned}
                    onFocus={(event) => onIconFocus(event.currentTarget)}
                    className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
                      isActive
                        ? "bg-action text-surface"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-strong"
                    }`}
                    aria-controls="desktop-sidebar"
                    aria-expanded={expanded}
                    aria-pressed={pinned}
                    aria-label={pinned ? `Recolher menu; ${item.label}` : `Fixar menu aberto; ${item.label}`}
                    title={expanded ? undefined : item.label}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                  </button>

                  {expanded && (
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      className={({ isActive: linkIsActive }) =>
                        `flex min-h-11 min-w-0 flex-1 items-center rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar motion-reduce:transition-none ${
                          linkIsActive
                            ? "bg-action text-surface"
                            : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-strong"
                        }`
                      }
                    >
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {filteredGroups.length === 0 && expanded && (
          <div className="rounded-md border border-sidebar-text/40 px-3 py-4 text-sm text-sidebar-text" role="status">
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

export function Sidebar({
  open,
  collapsed,
  onCollapsedChange,
  onClose,
  triggerRef,
  desktopFirstControlRef,
}: SidebarProps) {
  const { usuario } = useAuth();
  const groups = useMemo(
    () => (usuario?.papel === "admin" ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS),
    [usuario?.papel],
  );
  const [query, setQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const desktopAsideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const lastDesktopControlRef = useRef<HTMLButtonElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const shouldFocusSearchRef = useRef(false);

  const pinned = !collapsed;
  const expanded = pinned || previewOpen;

  const clearPreviewTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const supportsHover = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [],
  );

  const schedulePreviewOpen = useCallback(() => {
    if (!collapsed || !supportsHover()) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => setPreviewOpen(true), PREVIEW_OPEN_DELAY);
  }, [collapsed, supportsHover]);

  const schedulePreviewClose = useCallback(() => {
    if (!collapsed) return;
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      if (!pointerInsideRef.current && !focusInsideRef.current) setPreviewOpen(false);
    }, PREVIEW_CLOSE_DELAY);
  }, [collapsed]);

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    pointerInsideRef.current = true;
    if (event.pointerType === "mouse") schedulePreviewOpen();
  }

  function handlePointerLeave() {
    pointerInsideRef.current = false;
    schedulePreviewClose();
  }

  function handleFocusCapture() {
    focusInsideRef.current = true;
    if (collapsed) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setPreviewOpen(true);
    }
  }

  function handleBlurCapture(event: FocusEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    focusInsideRef.current = false;
    schedulePreviewClose();
  }

  function handleIconFocus(element: HTMLButtonElement) {
    lastDesktopControlRef.current = element;
  }

  function handleTogglePinned(event: MouseEvent<HTMLButtonElement>) {
    if (collapsed) {
      clearPreviewTimers();
      setPreviewOpen(false);
      onCollapsedChange(false);
      return;
    }

    onCollapsedChange(true);
    const activatedWithKeyboard = event.detail === 0;
    setPreviewOpen(
      (activatedWithKeyboard && focusInsideRef.current) || (pointerInsideRef.current && supportsHover()),
    );
  }

  function handlePinAndSearch() {
    shouldFocusSearchRef.current = true;
    if (collapsed) {
      clearPreviewTimers();
      setPreviewOpen(false);
      onCollapsedChange(false);
    } else {
      window.requestAnimationFrame(() => desktopSearchRef.current?.focus());
    }
  }

  function handleDesktopKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !collapsed || !previewOpen) return;
    event.preventDefault();
    const lastDesktopControl = lastDesktopControlRef.current;
    clearPreviewTimers();
    setPreviewOpen(false);
    window.requestAnimationFrame(() => {
      const focusTarget = lastDesktopControl?.isConnected ? lastDesktopControl : desktopFirstControlRef.current;
      focusTarget?.focus();
    });
  }

  useEffect(() => {
    if (!collapsed && shouldFocusSearchRef.current) {
      shouldFocusSearchRef.current = false;
      window.requestAnimationFrame(() => desktopSearchRef.current?.focus());
    }
  }, [collapsed]);

  useEffect(() => () => clearPreviewTimers(), [clearPreviewTimers]);

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
    function focusDesktopFirstControl() {
      window.requestAnimationFrame(() => {
        const focusTarget = desktopFirstControlRef.current ?? document.querySelector<HTMLElement>("main");
        focusTarget?.focus();
      });
    }

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        shouldRestoreTriggerFocus = false;
        onClose();
        focusDesktopFirstControl();
      }
    }
    mediaQuery.addEventListener("change", handleViewportChange);

    if (mediaQuery.matches) {
      shouldRestoreTriggerFocus = false;
      onClose();
      focusDesktopFirstControl();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
      if (shouldRestoreTriggerFocus) triggerElement?.focus();
    };
  }, [desktopFirstControlRef, onClose, open, triggerRef]);

  return (
    <>
      <div
        className={`relative hidden h-full min-h-0 shrink-0 transition-[width] duration-200 ease-out md:block motion-reduce:transition-none ${
          collapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <aside
          ref={desktopAsideRef}
          id="desktop-sidebar"
          aria-labelledby="desktop-sidebar-title"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          onKeyDown={handleDesktopKeyDown}
          className={`flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-text transition-[width] duration-200 ease-out motion-reduce:transition-none ${
            collapsed && previewOpen ? "absolute inset-y-0 left-0 z-30 w-64" : collapsed ? "w-[4.5rem]" : "w-64"
          }`}
        >
          <DesktopSidebarContent
            groups={groups}
            expanded={expanded}
            pinned={pinned}
            query={query}
            onQueryChange={setQuery}
            onTogglePinned={handleTogglePinned}
            onPinAndSearch={handlePinAndSearch}
            firstControlRef={desktopFirstControlRef}
            searchInputRef={desktopSearchRef}
            onIconFocus={handleIconFocus}
          />
        </aside>
      </div>

      {open && (
        <>
          <div className="absolute inset-0 z-20 bg-sidebar/40 md:hidden" onClick={onClose} aria-hidden="true" />
          <aside
            ref={drawerRef}
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-sidebar-title"
            className="mobile-sidebar absolute inset-y-0 left-0 z-30 flex w-64 max-w-[calc(100vw-3rem)] flex-col overflow-hidden bg-sidebar text-sidebar-text md:hidden"
          >
            <MobileSidebarContent
              groups={groups}
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
