import { useAuth } from "../../hooks/useAuth";
import { useDashboardMetricas } from "../../hooks/useDashboardMetricas";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

interface TileProps {
  titulo: string;
  valor: string;
  legenda?: string;
}

function Tile({ titulo, valor, legenda }: TileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <p className="text-sm font-medium text-muted">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{valor}</p>
      {legenda && <p className="mt-1 text-xs text-muted">{legenda}</p>}
    </div>
  );
}

export function Dashboard() {
  useDocumentTitle("Dashboard");
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0];
  const { data: metricas } = useDashboardMetricas();

  return (
    <div>
      <h1 className="break-words text-2xl font-semibold text-ink">
        {primeiroNome ? `Olá, ${primeiroNome}` : "Olá"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Os indicadores de estoque, produção e pedidos parados aparecerão aqui.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile titulo="Estoque baixo" valor="—" />
        <Tile titulo="Pedidos parados" valor={metricas ? String(metricas.pedidos_pendentes) : "—"} />
        <Tile
          titulo="Produções recentes"
          valor={metricas ? String(metricas.producoes_recentes) : "—"}
          legenda="últimos 7 dias"
        />
      </div>
    </div>
  );
}
