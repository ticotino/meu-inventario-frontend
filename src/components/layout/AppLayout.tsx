import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("meu-inventario:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopFirstControlRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const changeSidebarCollapsed = useCallback((collapsed: boolean) => setSidebarCollapsed(collapsed), []);

  useEffect(() => {
    try {
      window.localStorage.setItem("meu-inventario:sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // A navegação continua funcional quando o armazenamento do navegador está indisponível.
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app-shell grid h-dvh min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-page">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo
      </a>
      <Topbar
        onMenuClick={openSidebar}
        menuExpanded={sidebarOpen}
        menuButtonRef={menuButtonRef}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="app-content relative flex min-h-0 min-w-0 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onCollapsedChange={changeSidebarCollapsed}
          onClose={closeSidebar}
          triggerRef={menuButtonRef}
          desktopFirstControlRef={desktopFirstControlRef}
        />
        <main
          ref={mainRef}
          id="conteudo-principal"
          tabIndex={-1}
          inert={sidebarOpen}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-action md:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
