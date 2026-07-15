import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { ResponsiveTable } from "../components/ui/ResponsiveTable";
import type { Coluna } from "../components/ui/ResponsiveTable";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useRelatorioConsumo, useRelatorioPedidos, useRelatorioProducao } from "../hooks/useRelatorios";
import { getApiErrorMessage } from "../services/api";
import type { RelatorioConsumoItem, RelatorioPedidosItem, RelatorioPeriodo, RelatorioProducaoItem } from "../types/relatorio";
import { formatarMoeda, formatarQuantidade } from "../utils/format";

function formatarIsoLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function periodoPadrao(): RelatorioPeriodo {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setDate(inicio.getDate() - 29);
  return { inicio: formatarIsoLocal(inicio), fim: formatarIsoLocal(fim) };
}

function validarPeriodo(periodo: RelatorioPeriodo) {
  if (!periodo.inicio || !periodo.fim) return "Informe as datas inicial e final.";
  const inicio = new Date(`${periodo.inicio}T00:00:00`);
  const fim = new Date(`${periodo.fim}T00:00:00`);
  if (fim < inicio) return "A data final deve ser igual ou posterior à data inicial.";
  const diasInclusivos = Math.round((fim.getTime() - inicio.getTime()) / 86_400_000) + 1;
  if (diasInclusivos > 366) return "Selecione um período de no máximo 366 dias.";
  return null;
}

function Secao({ id, titulo, descricao, children }: { id: string; titulo: string; descricao: string; children: ReactNode }) {
  return <section aria-labelledby={id} className="space-y-3"><div><h2 id={id} className="text-lg font-semibold text-ink">{titulo}</h2><p className="mt-1 max-w-3xl text-sm text-muted">{descricao}</p></div>{children}</section>;
}

export function Relatorios() {
  useDocumentTitle("Relatórios");
  const [rascunho, setRascunho] = useState<RelatorioPeriodo>(periodoPadrao);
  const [periodo, setPeriodo] = useState<RelatorioPeriodo>(rascunho);
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null);
  const consumo = useRelatorioConsumo(periodo);
  const producao = useRelatorioProducao(periodo);
  const pedidos = useRelatorioPedidos(periodo);

  function aplicarPeriodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const erro = validarPeriodo(rascunho);
    setErroPeriodo(erro);
    if (!erro) setPeriodo({ ...rascunho });
  }

  const colunasConsumo: Coluna<RelatorioConsumoItem>[] = [
    { header: "Matéria-prima", cell: (item) => <><span className="block font-medium text-ink">{item.nome_tecido}</span><span className="block text-xs tabular-nums text-muted">{item.codigo}{item.cor ? ` · ${item.cor}` : ""}</span></> },
    { header: "Consumido", alignRight: true, cell: (item) => <span className="tabular-nums">{formatarQuantidade(item.quantidade_consumida, item.unidade_medida)}</span> },
    { header: "Produções", alignRight: true, cell: (item) => <span className="tabular-nums">{item.total_producoes}</span> },
    { header: "Custo", alignRight: true, cell: (item) => <span className="tabular-nums">{formatarMoeda(item.custo_total)}</span> },
  ];
  const colunasProducao: Coluna<RelatorioProducaoItem>[] = [
    { header: "Produto", cell: (item) => <><span className="block font-medium text-ink">{item.nome}</span><span className="block text-xs tabular-nums text-muted">{item.codigo}</span></> },
    { header: "Produzido", alignRight: true, cell: (item) => <span className="tabular-nums">{formatarQuantidade(item.quantidade_produzida, "unidade")}</span> },
    { header: "Produções", alignRight: true, cell: (item) => <span className="tabular-nums">{item.total_producoes}</span> },
    { header: "Custo de materiais", alignRight: true, cell: (item) => <span className="tabular-nums">{formatarMoeda(item.custo_total)}</span> },
  ];
  const colunasPedidos: Coluna<RelatorioPedidosItem>[] = [
    { header: "Produto", cell: (item) => <><span className="block font-medium text-ink">{item.nome}</span><span className="block text-xs tabular-nums text-muted">{item.codigo}</span></> },
    { header: "Faturado", alignRight: true, cell: (item) => <span className="tabular-nums">{formatarQuantidade(item.quantidade_faturada, "unidade")}</span> },
    { header: "Pedidos", alignRight: true, cell: (item) => <span className="tabular-nums">{item.total_pedidos}</span> },
  ];

  return <div className="space-y-8">
    <PageHeader titulo="Relatórios" descricao="Consulte consumo, produção e produtos faturados em um período de até 366 dias." />
    <form onSubmit={aplicarPeriodo} className="rounded-lg border border-border bg-surface p-4 shadow-card" noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-48"><Input id="relatorio-inicio" label="Data inicial" type="date" required value={rascunho.inicio} onChange={(event) => setRascunho((atual) => ({ ...atual, inicio: event.target.value }))} /></div>
        <div className="w-full sm:max-w-48"><Input id="relatorio-fim" label="Data final" type="date" required value={rascunho.fim} onChange={(event) => setRascunho((atual) => ({ ...atual, fim: event.target.value }))} /></div>
        <Button type="submit">Atualizar relatórios</Button>
      </div>
      {erroPeriodo && <p role="alert" className="mt-3 text-sm text-danger">{erroPeriodo}</p>}
    </form>

    <Secao id="relatorio-consumo" titulo="Consumo de matérias-primas" descricao="Quantidades consumidas nas produções do período. O custo fica indisponível quando falta valor unitário.">
      {consumo.isPending ? <TableSkeleton linhas={4} /> : consumo.isError ? <ErrorState mensagem={getApiErrorMessage(consumo.error, "Não foi possível carregar o consumo.")} onRetry={() => void consumo.refetch()} /> : consumo.data.length === 0 ? <EmptyState titulo="Nenhum consumo no período" descricao="Não há matérias-primas consumidas nas datas selecionadas." /> : <ResponsiveTable items={consumo.data} columns={colunasConsumo} getRowKey={(item) => item.materia_prima_id} caption="Consumo de matérias-primas no período" mobileCard={(item) => <div className="space-y-1"><p className="font-medium text-ink">{item.nome_tecido}</p><p className="text-sm tabular-nums text-body">{formatarQuantidade(item.quantidade_consumida, item.unidade_medida)} · {item.total_producoes} produções</p><p className="text-sm tabular-nums text-muted">Custo: {formatarMoeda(item.custo_total)}</p></div>} />}
    </Secao>
    <Secao id="relatorio-producao" titulo="Produção" descricao="Produtos finalizados e custo conhecido das matérias-primas consumidas.">
      {producao.isPending ? <TableSkeleton linhas={4} /> : producao.isError ? <ErrorState mensagem={getApiErrorMessage(producao.error, "Não foi possível carregar a produção.")} onRetry={() => void producao.refetch()} /> : producao.data.length === 0 ? <EmptyState titulo="Nenhuma produção no período" descricao="Não há produções registradas nas datas selecionadas." /> : <ResponsiveTable items={producao.data} columns={colunasProducao} getRowKey={(item) => item.produto_id} caption="Produção por produto no período" mobileCard={(item) => <div className="space-y-1"><p className="font-medium text-ink">{item.nome}</p><p className="text-sm tabular-nums text-body">{formatarQuantidade(item.quantidade_produzida, "unidade")} · {item.total_producoes} produções</p><p className="text-sm tabular-nums text-muted">Custo: {formatarMoeda(item.custo_total)}</p></div>} />}
    </Secao>
    <Secao id="relatorio-pedidos" titulo="Produtos faturados" descricao="Quantidades dos produtos incluídos em pedidos faturados no período, sem estimativas de receita ou margem.">
      {pedidos.isPending ? <TableSkeleton linhas={4} /> : pedidos.isError ? <ErrorState mensagem={getApiErrorMessage(pedidos.error, "Não foi possível carregar os pedidos faturados.")} onRetry={() => void pedidos.refetch()} /> : pedidos.data.length === 0 ? <EmptyState titulo="Nenhum produto faturado no período" descricao="Não há pedidos faturados nas datas selecionadas." /> : <ResponsiveTable items={pedidos.data} columns={colunasPedidos} getRowKey={(item) => item.produto_id} caption="Produtos faturados no período" mobileCard={(item) => <div className="space-y-1"><p className="font-medium text-ink">{item.nome}</p><p className="text-sm tabular-nums text-body">{formatarQuantidade(item.quantidade_faturada, "unidade")}</p><p className="text-sm text-muted">{item.total_pedidos} pedidos faturados</p></div>} />}
    </Secao>
  </div>;
}
