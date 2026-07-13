import { NavLink } from "react-router-dom";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none ${
    isActive ? "border-action text-action" : "border-transparent text-muted hover:text-body"
  }`;

export function PedidosTabs() {
  return (
    <nav aria-label="Seções de pedidos" className="flex gap-6 border-b border-border">
      <NavLink to="/pedidos" end className={tabClass}>
        Pedidos
      </NavLink>
      <NavLink to="/pedidos/clientes" end className={tabClass}>
        Clientes
      </NavLink>
    </nav>
  );
}
