import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("meu-inventario:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((collapsed) => !collapsed), []);
  const expandSidebar = useCallback(() => setSidebarCollapsed(false), []);

  useEffect(() => {
    try {
      window.localStorage.setItem("meu-inventario:sidebar-collapsed", String(sidebarCollapsed));
    } catch {
      // A navegação continua funcional quando o armazenamento do navegador está indisponível.
    }
  }, [sidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-page">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapsed={toggleSidebarCollapsed}
        onExpand={expandSidebar}
        triggerRef={menuButtonRef}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={openSidebar}
          menuExpanded={sidebarOpen}
          menuButtonRef={menuButtonRef}
        />
        <main
          id="conteudo-principal"
          tabIndex={-1}
          className="min-w-0 flex-1 p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-action md:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
