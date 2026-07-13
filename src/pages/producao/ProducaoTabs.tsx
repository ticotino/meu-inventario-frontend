import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none ${
    isActive ? "border-action text-action" : "border-transparent text-muted hover:text-body"
  }`;

export function ProducaoTabs() {
  return (
    <nav aria-label="Seções de produção" className="flex gap-6 border-b border-border">
      <NavLink to="/producao" end className={tabClass}>
        Produções
      </NavLink>
      <NavLink to="/producao/produtos" end className={tabClass}>
        Produtos
      </NavLink>
    </nav>
  );
}
