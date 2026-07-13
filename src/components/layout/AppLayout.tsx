import { useCallback, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen bg-page">
      <a href="#conteudo-principal" className="skip-link">
        Pular para o conteúdo
      </a>
      <Sidebar open={sidebarOpen} onClose={closeSidebar} triggerRef={menuButtonRef} />
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
