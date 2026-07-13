import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useRomaneios } from "../../hooks/useRomaneios";
import { getApiErrorMessage } from "../../services/api";
import type { Romaneio } from "../../types/romaneio";
import { formatarData } from "../../utils/format";

export function Romaneios() {
  useDocumentTitle("Romaneios");
  const { data: romaneios, isPending, isError, error, refetch } = useRomaneios();

  const colunas: Coluna<Romaneio>[] = [
    {
      header: "Código",
      cell: (r) => (
        <Link to={`/romaneios/${r.id}`} className="font-medium tabular-nums text-action hover:underline">
          {r.codigo}
        </Link>
      ),
    },
    {
      header: "Pedido",
      cell: (r) => (
        <Link to={`/pedidos/${r.pedido_id}`} className="tabular-nums text-action hover:underline">
          {r.pedido_codigo}
        </Link>
      ),
    },
    { header: "Cliente", cell: (r) => r.cliente_nome },
    {
      header: "Volumes",
      alignRight: true,
      cell: (r) => <span className="tabular-nums">{r.volumes_total}</span>,
    },
    { header: "Data de saída", cell: (r) => formatarData(r.data_saida) },
    {
      header: "Ações",
      alignRight: true,
      cell: (r) => (
        <Link to={`/romaneios/${r.id}`} className="text-sm font-medium text-action hover:underline">
          Detalhes
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Romaneios"
        descricao="Documentos de expedição: como cada pedido foi empacotado em caixas."
        action={
          <Link to="/romaneios/novo" className={buttonClasses("primary")}>
            Gerar romaneio
          </Link>
        }
      />

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os romaneios.")}
          onRetry={() => void refetch()}
        />
      ) : romaneios.length === 0 ? (
        <EmptyState
          titulo="Nenhum romaneio gerado"
          descricao={
            <>
              O romaneio registra como um pedido foi empacotado em caixas e marca o pedido como atendido. Comece por
              um{" "}
              <Link to="/pedidos" className="font-medium text-action hover:underline">
                pedido pendente
              </Link>
              .
            </>
          }
          action={
            <Link to="/romaneios/novo" className={buttonClasses("primary")}>
              Gerar o primeiro romaneio
            </Link>
          }
        />
      ) : (
        <ResponsiveTable
          items={romaneios}
          columns={colunas}
          getRowKey={(r) => r.id}
          caption="Lista de romaneios"
          mobileCard={(r) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{r.codigo}</span> · {r.cliente_nome}
              </p>
              <p className="text-sm text-body tabular-nums">
                Pedido {r.pedido_codigo} · {r.volumes_total} {r.volumes_total === 1 ? "volume" : "volumes"}
              </p>
              <p className="text-sm text-muted">{formatarData(r.data_saida)}</p>
              <div className="pt-1">
                <Link to={`/romaneios/${r.id}`} className="text-sm font-medium text-action hover:underline">
                  Detalhes
                </Link>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
