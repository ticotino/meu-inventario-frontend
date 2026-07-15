import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDashboardMetricas } from "../../hooks/useDashboardMetricas";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

interface TileProps {
  titulo: string;
  valor: string;
  legenda?: string;
  link?: { to: string; label: string };
}

function Tile({ titulo, valor, legenda, link }: TileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <p className="text-sm font-medium text-muted">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{valor}</p>
      {legenda && <p className="mt-1 text-xs text-muted">{legenda}</p>}
      {link && (
        <Link
          to={link.to}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-action underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
        >
          {link.label}
        </Link>
      )}
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
        Confira as pendências mais importantes antes de voltar à operação.
      </p>

      <section aria-labelledby="dashboard-pendencias" className="mt-6">
        <h2 id="dashboard-pendencias" className="text-base font-semibold text-ink">
          Pendências
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          titulo="Estoque baixo"
          valor={metricas ? String(metricas.estoque_baixo_total) : "—"}
          legenda={
            metricas
              ? `${metricas.materias_primas_estoque_baixo} matérias-primas · ${metricas.produtos_estoque_baixo} produtos`
              : undefined
          }
          link={{ to: "/materias-primas?estoque_baixo=true", label: "Ver itens críticos" }}
        />
        <Tile
          titulo="Pedidos atrasados"
          valor={metricas ? String(metricas.pedidos_atrasados) : "—"}
          legenda={metricas ? `${metricas.pedidos_proximos} vencem nos próximos 3 dias` : undefined}
          link={{ to: "/pedidos?prazo=atrasado", label: "Ver pedidos" }}
        />
        <Tile
          titulo="Compras solicitadas"
          valor={metricas ? String(metricas.compras_pendentes) : "—"}
          legenda="aguardando recebimento"
          link={{ to: "/compras", label: "Ver lista de compras" }}
        />
        </div>
      </section>

      <section aria-labelledby="dashboard-atividade" className="mt-6 max-w-md">
        <h2 id="dashboard-atividade" className="text-base font-semibold text-ink">
          Atividade recente
        </h2>
        <div className="mt-3">
          <Tile
            titulo="Produções registradas"
            valor={metricas ? String(metricas.producoes_recentes) : "—"}
            legenda="últimos 7 dias"
          />
        </div>
      </section>
    </div>
  );
}
