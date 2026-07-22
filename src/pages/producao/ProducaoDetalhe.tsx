import { Link, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses } from "../../components/ui/formStyles";
import { useServicosExternos } from "../../hooks/useServicosExternos";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useProducao } from "../../hooks/useProducoes";
import { getApiErrorMessage } from "../../services/api";
import type { ServicoExterno } from "../../types/servicoExterno";
import type { ProducaoItem } from "../../types/producao";
import { STATUS_SERVICO_EXTERNO_CLASS, STATUS_SERVICO_EXTERNO_LABEL } from "../servicos-externos/statusServicoExterno";
import { TIPO_SERVICO_EXTERNO_LABEL } from "../servicos-externos/tipoServicoExterno";
import { formatarData, formatarQuantidade } from "../../utils/format";

function ResumoItem({ rotulo, valor, destaque = false }: { rotulo: string; valor: React.ReactNode; destaque?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className={destaque ? "mt-0.5 text-2xl font-semibold tabular-nums text-ink" : "mt-0.5 text-sm text-body"}>
        {valor}
      </dd>
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div role="status" aria-label="Carregando..." className="space-y-6">
      <div className="animate-pulse space-y-2 motion-reduce:animate-none">
        <div className="h-7 w-48 rounded bg-border" />
        <div className="h-4 w-72 rounded bg-border/60" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="animate-pulse space-y-3 motion-reduce:animate-none">
            <div className="h-4 w-1/4 rounded bg-border" />
            <div className="h-9 rounded bg-border/60" />
            <div className="h-9 rounded bg-border/60" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

function ServicoExternoSecao({ producaoId }: { producaoId: string }) {
  const { data: servicosExternos, isPending, isError, error, refetch } = useServicosExternos({ producaoId });

  const colunasServicoExterno: Coluna<ServicoExterno>[] = [
    {
      header: "Código",
      cell: (s) => (
        <Link to={`/servicos-externos/${s.id}`} className="font-medium tabular-nums text-action hover:underline">
          {s.codigo}
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
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">Serviços externos</h2>
        <Link to={`/servicos-externos/novo?producao=${producaoId}`} className={buttonClasses("secondary")}>
          Enviar para serviço externo
        </Link>
      </div>

      {isPending ? (
        <TableSkeleton linhas={2} />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar o serviço externo desta produção.")}
          onRetry={() => void refetch()}
        />
      ) : servicosExternos.length === 0 ? (
        <EmptyState
          titulo="Nenhum serviço externo enviado ainda"
          descricao="Envie peças desta produção para costura externa, silk ou bordado."
          action={
            <Link to={`/servicos-externos/novo?producao=${producaoId}`} className={buttonClasses("primary")}>
              Enviar para serviço externo
            </Link>
          }
        />
      ) : (
        <ResponsiveTable
          items={servicosExternos}
          columns={colunasServicoExterno}
          getRowKey={(s) => s.id}
          caption="Serviços externos vinculados a esta produção"
          mobileCard={(s) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{s.codigo}</span> · {s.prestador_nome}
              </p>
              <p className="text-sm text-body">
                {TIPO_SERVICO_EXTERNO_LABEL[s.tipo]} ·{" "}
                <span className={STATUS_SERVICO_EXTERNO_CLASS[s.status]}>{STATUS_SERVICO_EXTERNO_LABEL[s.status]}</span>
              </p>
              <div className="pt-1">
                <Link to={`/servicos-externos/${s.id}`} className="text-sm font-medium text-action hover:underline">
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

export function ProducaoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: producao, isPending, isError, error, refetch } = useProducao(id);
  useDocumentTitle(producao ? producao.codigo : "Produção");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar a produção.")}
          onRetry={() => void refetch()}
        />
        <Link to="/producao" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar ao registro de produções
        </Link>
      </div>
    );
  }

  const colunas: Coluna<ProducaoItem>[] = [
    { header: "Código", cell: (item) => <span className="tabular-nums">{item.codigo}</span> },
    {
      header: "Tecido",
      cell: (item) => (
        <span>
          <span className="block font-medium text-ink">{item.nome_tecido}</span>
          {item.cor && <span className="block text-xs text-muted">{item.cor}</span>}
        </span>
      ),
    },
    {
      header: "Quantidade consumida",
      alignRight: true,
      cell: (item) => (
        <span className="tabular-nums">{formatarQuantidade(item.quantidade_consumida, item.unidade_medida)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={producao.codigo}
        descricao={`Produção de ${producao.produto_nome} em ${formatarData(producao.data_producao)}`}
        action={
          <Link to="/producao" className="text-sm font-medium text-action hover:underline">
            Voltar ao registro
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Resumo</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResumoItem
            rotulo="Quantidade produzida"
            valor={formatarQuantidade(producao.quantidade_produzida, "unidade")}
            destaque
          />
          <ResumoItem
            rotulo="Produto"
            valor={
              <Link to={`/producao/produtos/${producao.produto_id}`} className="font-medium text-action hover:underline">
                {producao.produto_codigo} · {producao.produto_nome}
              </Link>
            }
          />
          <ResumoItem rotulo="Data da produção" valor={formatarData(producao.data_producao)} />
          <ResumoItem rotulo="Registrado por" valor={producao.usuario_nome} />
        </dl>
        {producao.observacoes && <p className="mt-4 text-sm text-body">{producao.observacoes}</p>}
        <p className="mt-4 text-xs text-muted">
          Produções são registros permanentes e não podem ser editadas — correções de estoque virão como ajustes.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-ink">Matérias-primas consumidas</h2>
        <ResponsiveTable
          items={producao.itens}
          columns={colunas}
          getRowKey={(item) => item.materia_prima_id}
          caption="Matérias-primas consumidas nesta produção"
          mobileCard={(item) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{item.codigo}</span> · {item.nome_tecido}
                {item.cor && <span className="text-muted"> ({item.cor})</span>}
              </p>
              <p className="text-sm text-body tabular-nums">
                Consumido: {formatarQuantidade(item.quantidade_consumida, item.unidade_medida)}
              </p>
            </div>
          )}
        />
      </div>

      <ServicoExternoSecao producaoId={producao.id} />
    </div>
  );
}
