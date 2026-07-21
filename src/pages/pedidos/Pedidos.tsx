import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { ResultsAnnouncer } from "../../components/ui/ResultsAnnouncer";
import { Select } from "../../components/ui/Select";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses } from "../../components/ui/formStyles";
import { useClientes } from "../../hooks/useClientes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePedidos } from "../../hooks/usePedidos";
import { getApiErrorMessage } from "../../services/api";
import type { Pedido, PedidoPrazoFiltro, PedidoStatus } from "../../types/pedido";
import { formatarData } from "../../utils/format";
import { PedidosTabs } from "./PedidosTabs";
import { STATUS_PEDIDO_CLASS, STATUS_PEDIDO_LABEL } from "./statusPedido";

export function Pedidos() {
  useDocumentTitle("Pedidos");
  const [clienteId, setClienteId] = useState("");
  const [status, setStatus] = useState<PedidoStatus | "">("");
  const [prazo, setPrazo] = useState<PedidoPrazoFiltro | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: pedidos, isPending, isError, error, refetch } = usePedidos({
    clienteId: clienteId || undefined,
    status: status || undefined,
    prazo: prazo || undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
  });
  const { data: clientes } = useClientes();

  const colunas: Coluna<Pedido>[] = [
    {
      header: "Código",
      cell: (pe) => (
        <Link to={`/pedidos/${pe.id}`} className="font-medium tabular-nums text-action hover:underline">
          {pe.codigo}
        </Link>
      ),
    },
    { header: "Cliente", cell: (pe) => pe.cliente_nome },
    {
      header: "Status",
      cell: (pe) => (
        <span>
          <span className={`font-medium ${STATUS_PEDIDO_CLASS[pe.status]}`}>{STATUS_PEDIDO_LABEL[pe.status]}</span>
          {pe.status === "pendente" && pe.parcialmente_atendido && (
            <span className="text-muted"> · parcial</span>
          )}
        </span>
      ),
    },
    { header: "Data", cell: (pe) => formatarData(pe.data_pedido) },
    {
      header: "Entrega",
      cell: (pe) => (
        <div>
          <span className="tabular-nums">{pe.data_prevista_entrega ? formatarData(pe.data_prevista_entrega) : "Sem prazo"}</span>
          {pe.status === "pendente" && pe.situacao_prazo !== "sem_prazo" && (
            <p className={`text-xs ${pe.situacao_prazo === "atrasado" ? "font-medium text-danger" : "text-muted"}`}>
              {pe.situacao_prazo === "atrasado"
                ? `${Math.abs(pe.dias_para_entrega ?? 0)} dia(s) em atraso`
                : pe.situacao_prazo === "vence_hoje"
                  ? "Vence hoje"
                  : `Faltam ${pe.dias_para_entrega ?? 0} dia(s)`}
            </p>
          )}
        </div>
      ),
    },
    { header: "Registrado por", cell: (pe) => pe.usuario_nome },
    {
      header: "Ações",
      alignRight: true,
      cell: (pe) => (
        <Link to={`/pedidos/${pe.id}`} className="text-sm font-medium text-action hover:underline">
          Detalhes
        </Link>
      ),
    },
  ];

  const temFiltro = clienteId !== "" || status !== "" || prazo !== "" || dataInicio !== "" || dataFim !== "";
  const semClientes = clientes !== undefined && clientes.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Pedidos"
        descricao="Registro de pedidos: o que os clientes encomendaram e o que já foi atendido ou faturado."
        action={
          <Link to="/pedidos/novo" className={buttonClasses("primary")}>
            Novo pedido
          </Link>
        }
      />

      <PedidosTabs />

      <div className="flex flex-wrap gap-3">
        <div className="max-w-56">
          <Select
            id="filtro-pedido-cliente"
            label="Filtrar por cliente"
            hideLabel
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Todos os clientes</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="max-w-48">
          <Select
            id="filtro-pedido-status"
            label="Filtrar por status"
            hideLabel
            value={status}
            onChange={(e) => setStatus(e.target.value as PedidoStatus | "")}
          >
            <option value="">Todos os status</option>
            {(Object.keys(STATUS_PEDIDO_LABEL) as PedidoStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_PEDIDO_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="max-w-48">
          <Select
            id="filtro-pedido-prazo"
            label="Filtrar por prazo"
            hideLabel
            value={prazo}
            onChange={(e) => setPrazo(e.target.value as PedidoPrazoFiltro | "")}
          >
            <option value="">Todos os prazos</option>
            <option value="atrasado">Atrasados</option>
            <option value="vence_hoje">Vencem hoje</option>
            <option value="proximo">Próximos 3 dias</option>
          </Select>
        </div>
        <div className="w-44">
          <Input
            id="filtro-pedido-data-inicio"
            label="Pedidos desde"
            type="date"
            value={dataInicio}
            max={dataFim || undefined}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Input
            id="filtro-pedido-data-fim"
            label="Pedidos até"
            type="date"
            value={dataFim}
            min={dataInicio || undefined}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      <ResultsAnnouncer
        count={pedidos?.length ?? 0}
        singular="pedido"
        plural="pedidos"
        genero="m"
        emptyMessage="Nenhum pedido encontrado"
        loading={isPending || isError}
      />

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os pedidos.")}
          onRetry={() => void refetch()}
        />
      ) : pedidos.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nenhum pedido para este filtro"
            descricao="Limpe os filtros para ver todos os pedidos registrados."
          />
        ) : (
          <EmptyState
            titulo="Nenhum pedido registrado"
            descricao={
              semClientes ? (
                <>
                  Registrar um pedido consome o estoque dos produtos encomendados. Antes, cadastre um{" "}
                  <Link to="/pedidos/clientes" className="font-medium text-action hover:underline">
                    cliente
                  </Link>
                  .
                </>
              ) : (
                "Registrar um pedido consome o estoque dos produtos encomendados."
              )
            }
            action={
              !semClientes && (
                <Link to="/pedidos/novo" className={buttonClasses("primary")}>
                  Registrar o primeiro pedido
                </Link>
              )
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={pedidos}
          columns={colunas}
          getRowKey={(pe) => pe.id}
          caption="Registro de pedidos"
          mobileCard={(pe) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{pe.codigo}</span> · {pe.cliente_nome}
              </p>
              <p className="text-sm text-body">
                <span className={`font-medium ${STATUS_PEDIDO_CLASS[pe.status]}`}>{STATUS_PEDIDO_LABEL[pe.status]}</span>
                {pe.status === "pendente" && pe.parcialmente_atendido && (
                  <span className="text-muted"> · parcial</span>
                )}{" "}
                · {formatarData(pe.data_pedido)}
              </p>
              <p className="text-sm text-body">
                Entrega: {pe.data_prevista_entrega ? formatarData(pe.data_prevista_entrega) : "sem prazo"}
                {pe.status === "pendente" && pe.situacao_prazo === "atrasado" && (
                  <span className="font-medium text-danger"> · {Math.abs(pe.dias_para_entrega ?? 0)} dia(s) em atraso</span>
                )}
              </p>
              <p className="text-sm text-muted">{pe.usuario_nome}</p>
              <div className="pt-1">
                <Link to={`/pedidos/${pe.id}`} className="text-sm font-medium text-action hover:underline">
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
