import { useAuth } from "../../contexts/AuthContext";

const INDICADORES = ["Estoque baixo", "Pedidos parados", "Produções recentes"];

export function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Olá, {usuario?.nome.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Os indicadores de estoque, produção e pedidos parados aparecerão aqui.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDICADORES.map((titulo) => (
          <div key={titulo} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{titulo}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
