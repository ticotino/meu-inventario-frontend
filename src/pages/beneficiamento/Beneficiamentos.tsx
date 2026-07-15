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
import { useBeneficiamentos } from "../../hooks/useBeneficiamentos";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePrestadores } from "../../hooks/usePrestadores";
import { getApiErrorMessage } from "../../services/api";
import type { Beneficiamento, StatusBeneficiamento, TipoBeneficiamento } from "../../types/beneficiamento";
import { TIPOS_BENEFICIAMENTO } from "../../types/beneficiamento";
import { formatarData, formatarMoeda, formatarQuantidade } from "../../utils/format";
import { BeneficiamentoTabs } from "./BeneficiamentoTabs";
import { STATUS_BENEFICIAMENTO_CLASS, STATUS_BENEFICIAMENTO_LABEL } from "./statusBeneficiamento";
import { TIPO_BENEFICIAMENTO_LABEL } from "./tipoBeneficiamento";

export function Beneficiamentos() {
  useDocumentTitle("Beneficiamento");
  const [tipo, setTipo] = useState<TipoBeneficiamento | "">("");
  const [status, setStatus] = useState<StatusBeneficiamento | "">("");
  const [prestadorId, setPrestadorId] = useState("");

  const {
    data: beneficiamentos,
    isPending,
    isError,
    error,
    refetch,
  } = useBeneficiamentos({
    tipo: tipo || undefined,
    status: status || undefined,
    prestadorId: prestadorId || undefined,
  });
  const { data: prestadores } = usePrestadores();

  const colunas: Coluna<Beneficiamento>[] = [
    {
      header: "Código",
      cell: (b) => (
        <Link to={`/beneficiamento/${b.id}`} className="font-medium tabular-nums text-action hover:underline">
          {b.codigo}
        </Link>
      ),
    },
    {
      header: "Produção",
      cell: (b) => (
        <Link to={`/producao/${b.producao_id}`} className="font-medium text-action hover:underline">
          {b.producao_codigo}
        </Link>
      ),
    },
    { header: "Prestador", cell: (b) => b.prestador_nome },
    { header: "Tipo", cell: (b) => TIPO_BENEFICIAMENTO_LABEL[b.tipo] },
    {
      header: "Status",
      cell: (b) => (
        <span className={STATUS_BENEFICIAMENTO_CLASS[b.status]}>{STATUS_BENEFICIAMENTO_LABEL[b.status]}</span>
      ),
    },
    {
      header: "Qtd. enviada",
      alignRight: true,
      cell: (b) => <span className="tabular-nums">{formatarQuantidade(b.quantidade_enviada, "unidade")}</span>,
    },
    {
      header: "Qtd. recebida",
      alignRight: true,
      cell: (b) =>
        b.quantidade_recebida !== null ? (
          <span className="tabular-nums">{formatarQuantidade(b.quantidade_recebida, "unidade")}</span>
        ) : (
          "—"
        ),
    },
    {
      header: "Valor cobrado",
      alignRight: true,
      cell: (b) => <span className="tabular-nums">{formatarMoeda(b.valor_cobrado)}</span>,
    },
  ];

  const temFiltro = tipo !== "" || status !== "" || prestadorId !== "";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Beneficiamento"
        descricao="Peças enviadas para costura externa, silk e bordado: quando saíram, quanto voltou e quanto custou."
      />

      <BeneficiamentoTabs />

      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select
            id="filtro-beneficiamento-tipo"
            label="Filtrar por tipo"
            hideLabel
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoBeneficiamento | "")}
          >
            <option value="">Todos os tipos</option>
            {TIPOS_BENEFICIAMENTO.map((t) => (
              <option key={t} value={t}>
                {TIPO_BENEFICIAMENTO_LABEL[t]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select
            id="filtro-beneficiamento-status"
            label="Filtrar por status"
            hideLabel
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusBeneficiamento | "")}
          >
            <option value="">Todos os status</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>
        <div className="w-56">
          <Select
            id="filtro-beneficiamento-prestador"
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
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os beneficiamentos.")}
          onRetry={() => void refetch()}
        />
      ) : beneficiamentos.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nenhum beneficiamento para este filtro"
            descricao="Limpe os filtros para ver todos os beneficiamentos registrados."
          />
        ) : (
          <EmptyState
            titulo="Nenhum beneficiamento registrado"
            descricao="Beneficiamentos registram o envio de peças produzidas para costura externa, silk ou bordado. Abra uma produção para enviar a primeira."
            action={
              <Link to="/producao" className={buttonClasses("primary")}>
                Ver produções
              </Link>
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={beneficiamentos}
          columns={colunas}
          getRowKey={(b) => b.id}
          caption="Registro de beneficiamentos"
          mobileCard={(b) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{b.codigo}</span> · {b.prestador_nome}
              </p>
              <p className="text-sm text-body">
                {TIPO_BENEFICIAMENTO_LABEL[b.tipo]} ·{" "}
                <span className={STATUS_BENEFICIAMENTO_CLASS[b.status]}>{STATUS_BENEFICIAMENTO_LABEL[b.status]}</span>
              </p>
              <p className="text-sm text-body tabular-nums">
                Enviado: {formatarQuantidade(b.quantidade_enviada, "unidade")} em {formatarData(b.data_envio)}
              </p>
              <div className="pt-1">
                <Link to={`/beneficiamento/${b.id}`} className="text-sm font-medium text-action hover:underline">
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
