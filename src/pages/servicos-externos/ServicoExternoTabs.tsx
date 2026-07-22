import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none ${
    isActive ? "border-action text-action" : "border-transparent text-muted hover:text-body"
  }`;

export function ServicoExternoTabs() {
  return (
    <nav aria-label="Seções de serviços externos" className="flex gap-6 border-b border-border">
      <NavLink to="/servicos-externos" end className={tabClass}>
        Serviços externos
      </NavLink>
      <NavLink to="/servicos-externos/prestadores" end className={tabClass}>
        Prestadores
      </NavLink>
    </nav>
  );
}
