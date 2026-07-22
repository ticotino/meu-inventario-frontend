import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { Select } from "../../components/ui/Select";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses } from "../../components/ui/formStyles";
import { useServicosExternos } from "../../hooks/useServicosExternos";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePrestadores } from "../../hooks/usePrestadores";
import { getApiErrorMessage } from "../../services/api";
import type { ServicoExterno, StatusServicoExterno, TipoServicoExterno } from "../../types/servicoExterno";
import { TIPOS_SERVICO_EXTERNO } from "../../types/servicoExterno";
import { formatarData, formatarMoeda, formatarQuantidade } from "../../utils/format";
import { ServicoExternoTabs } from "./ServicoExternoTabs";
import { STATUS_SERVICO_EXTERNO_CLASS, STATUS_SERVICO_EXTERNO_LABEL } from "./statusServicoExterno";
import { TIPO_SERVICO_EXTERNO_LABEL } from "./tipoServicoExterno";

export function ServicosExternos() {
  useDocumentTitle("Serviços externos");
  const [tipo, setTipo] = useState<TipoServicoExterno | "">("");
  const [status, setStatus] = useState<StatusServicoExterno | "">("");
  const [prestadorId, setPrestadorId] = useState("");

  const {
    data: servicosExternos,
    isPending,
    isError,
    error,
    refetch,
  } = useServicosExternos({
    tipo: tipo || undefined,
    status: status || undefined,
    prestadorId: prestadorId || undefined,
  });
  const { data: prestadores } = usePrestadores();

  const colunas: Coluna<ServicoExterno>[] = [
    {
      header: "Código",
      cell: (s) => (
        <Link to={`/servicos-externos/${s.id}`} className="font-medium tabular-nums text-action hover:underline">
          {s.codigo}
        </Link>
      ),
    },
    {
      header: "Produção",
      cell: (s) => (
        <Link to={`/producao/${s.producao_id}`} className="font-medium text-action hover:underline">
          {s.producao_codigo}
        </Link>
      ),
    },
    { header: "Prestador", cell: (s) => s.prestador_nome },
    { header: "Tipo", cell: (s) => TIPO_SERVICO_EXTERNO_LABEL[s.tipo] },
    {
      header: "Status",
      cell: (s) => (
        <span className={STATUS_SERVICO_EXTERNO_CLASS[s.status]}>{STATUS_SERVICO_EXTERNO_LABEL[s.status]}</span>
      ),
    },
    {
      header: "Qtd. enviada",
      alignRight: true,
      cell: (s) => (
        <span className="tabular-nums">{formatarQuantidade(s.quantidade_enviada, "unidade")}</span>
      ),
    },
    {
      header: "Qtd. recebida",
      alignRight: true,
      cell: (s) =>
        s.quantidade_recebida !== null ? (
          <span className="tabular-nums">{formatarQuantidade(s.quantidade_recebida, "unidade")}</span>
        ) : (
          "—"
        ),
    },
    {
      header: "Valor cobrado",
      alignRight: true,
      cell: (s) => <span className="tabular-nums">{formatarMoeda(s.valor_cobrado)}</span>,
    },
  ];

  const temFiltro = tipo !== "" || status !== "" || prestadorId !== "";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Serviços externos"
        descricao="Peças enviadas para costura externa, silk e bordado: quando saíram, quanto voltou e quanto custou."
        action={
          <Link to="/servicos-externos/novo" className={buttonClasses("primary")}>
            Enviar para serviço externo
          </Link>
        }
      />

      <ServicoExternoTabs />

      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select
            id="filtro-servico-externo-tipo"
            label="Filtrar por tipo"
            hideLabel
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoServicoExterno | "")}
          >
            <option value="">Todos os tipos</option>
            {TIPOS_SERVICO_EXTERNO.map((t) => (
              <option key={t} value={t}>
                {TIPO_SERVICO_EXTERNO_LABEL[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select
            id="filtro-servico-externo-status"
            label="Filtrar por status"
            hideLabel
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusServicoExterno | "")}
          >
            <option value="">Todos os status</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
        <div className="w-56">
          <Select
            id="filtro-servico-externo-prestador"
            label="Filtrar por prestador"
            hideLabel
            value={prestadorId}
            onChange={(e) => setPrestadorId(e.target.value)}
          >
            <option value="">Todos os prestadores</option>
            {prestadores?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os serviços externos.")}
          onRetry={() => void refetch()}
        />
      ) : servicosExternos.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nenhum serviço externo para este filtro"
            descricao="Limpe os filtros para ver todos os serviços externos registrados."
          />
        ) : (
          <EmptyState
            titulo="Nenhum serviço externo registrado"
            descricao="Serviços externos registram o envio de peças produzidas para costura externa, silk ou bordado. Abra uma produção para enviar a primeira."
            action={
              <Link to="/producao" className={buttonClasses("primary")}>
                Ver produções
              </Link>
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={servicosExternos}
          columns={colunas}
          getRowKey={(s) => s.id}
          caption="Registro de serviços externos"
          mobileCard={(s) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{s.codigo}</span> · {s.prestador_nome}
              </p>
              <p className="text-sm text-body">
                {TIPO_SERVICO_EXTERNO_LABEL[s.tipo]} ·{" "}
                <span className={STATUS_SERVICO_EXTERNO_CLASS[s.status]}>
                  {STATUS_SERVICO_EXTERNO_LABEL[s.status]}
                </span>
              </p>
              <p className="text-sm text-body tabular-nums">
                Enviado: {formatarQuantidade(s.quantidade_enviada, "unidade")} em {formatarData(s.data_envio)}
              </p>
              <div className="pt-1">
                <Link
                  to={`/servicos-externos/${s.id}`}
                  className="text-sm font-medium text-action hover:underline"
                >
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
