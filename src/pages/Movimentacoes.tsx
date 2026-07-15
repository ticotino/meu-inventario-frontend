import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { ResponsiveTable } from "../components/ui/ResponsiveTable";
import type { Coluna } from "../components/ui/ResponsiveTable";
import { Select } from "../components/ui/Select";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useMateriasPrimas } from "../hooks/useMateriasPrimas";
import { useMovimentacoesEstoque } from "../hooks/useMovimentacoesEstoque";
import { useProdutos } from "../hooks/useProdutos";
import { getApiErrorMessage } from "../services/api";
import type {
  MovimentacaoEstoque,
  MovimentacaoItemTipo,
  MovimentacaoTipo,
} from "../types/movimentacaoEstoque";
import { MOVIMENTACAO_TIPO_LABEL, TIPOS_MOVIMENTACAO } from "../types/movimentacaoEstoque";
import { formatarQuantidade } from "../utils/format";

function formatarDataHoraCompleta(valor: string): string {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function LinkItem({ movimento }: { movimento: MovimentacaoEstoque }) {
  const destino =
    movimento.item_tipo === "materia_prima"
      ? `/materias-primas/${movimento.item_id}`
      : `/producao/produtos/${movimento.item_id}`;
  return (
    <Link to={destino} className="font-medium text-action hover:underline">
      <span className="tabular-nums">{movimento.item_codigo}</span> · {movimento.item_nome}
    </Link>
  );
}

function Referencia({ movimento }: { movimento: MovimentacaoEstoque }) {
  if (!movimento.referencia_tipo || !movimento.referencia_id)
    return <span className="text-muted">Sem referência</span>;

  const destinos: Record<string, string> = {
    materia_prima: `/materias-primas/${movimento.referencia_id}`,
    producao: `/producao/${movimento.referencia_id}`,
    pedido: `/pedidos/${movimento.referencia_id}`,
    romaneio: `/romaneios/${movimento.referencia_id}`,
  };
  const rotulos: Record<string, string> = {
    materia_prima: "Cadastro",
    producao: "Produção",
    pedido: "Pedido",
    romaneio: "Romaneio",
    solicitacao_compra: "Compra",
  };
  const conteudo =
    `${rotulos[movimento.referencia_tipo] ?? "Registro"} ${movimento.referencia_codigo ?? ""}`.trim();
  const destino = destinos[movimento.referencia_tipo];

  return destino ? (
    <Link to={destino} className="text-action hover:underline">
      {conteudo}
    </Link>
  ) : (
    <span>{conteudo}</span>
  );
}

function Quantidade({ movimento }: { movimento: MovimentacaoEstoque }) {
  const sinal = movimento.direcao === "entrada" ? "+" : "−";
  const classe = movimento.direcao === "entrada" ? "text-success" : "text-danger";
  return (
    <span className={`font-medium tabular-nums ${classe}`}>
      <span aria-hidden="true">{sinal}</span>
      <span className="sr-only">{movimento.direcao === "entrada" ? "Entrada de" : "Saída de"}</span>{" "}
      {formatarQuantidade(movimento.quantidade, movimento.item_unidade_medida)}
    </span>
  );
}

export function Movimentacoes() {
  useDocumentTitle("Movimentações");
  const [searchParams] = useSearchParams();
  const itemTipoInicial = searchParams.get("item_tipo");
  const [itemTipo, setItemTipo] = useState<MovimentacaoItemTipo | "">(() =>
    itemTipoInicial === "materia_prima" || itemTipoInicial === "produto" ? itemTipoInicial : "",
  );
  const [itemId, setItemId] = useState(() => searchParams.get("item_id") ?? "");
  const [tipo, setTipo] = useState<MovimentacaoTipo | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cursorAtual, setCursorAtual] = useState<string | undefined>();
  const [cursoresAnteriores, setCursoresAnteriores] = useState<(string | undefined)[]>([]);

  const { data: materiasPrimas } = useMateriasPrimas({ ativo: true });
  const { data: produtos } = useProdutos({ ativo: true });
  const { data, isPending, isFetching, isError, error, refetch } = useMovimentacoesEstoque({
    itemTipo: itemTipo || undefined,
    itemId: itemId || undefined,
    tipo: tipo || undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    cursor: cursorAtual,
  });

  const colunas: Coluna<MovimentacaoEstoque>[] = [
    {
      header: "Data",
      cell: (movimento) => (
        <span className="tabular-nums">{formatarDataHoraCompleta(movimento.criado_em)}</span>
      ),
    },
    { header: "Item", cell: (movimento) => <LinkItem movimento={movimento} /> },
    { header: "Movimento", cell: (movimento) => MOVIMENTACAO_TIPO_LABEL[movimento.tipo] },
    { header: "Quantidade", alignRight: true, cell: (movimento) => <Quantidade movimento={movimento} /> },
    {
      header: "Saldo",
      alignRight: true,
      cell: (movimento) => (
        <span className="tabular-nums">
          {formatarQuantidade(movimento.saldo_resultante, movimento.item_unidade_medida)}
        </span>
      ),
    },
    { header: "Referência", cell: (movimento) => <Referencia movimento={movimento} /> },
    { header: "Registrado por", cell: (movimento) => movimento.usuario_nome },
  ];

  const temFiltro = Boolean(itemTipo || itemId || tipo || dataInicio || dataFim);
  const opcoesItem = itemTipo === "materia_prima" ? materiasPrimas : itemTipo === "produto" ? produtos : [];

  function limparFiltros() {
    resetarPaginacao();
    setItemTipo("");
    setItemId("");
    setTipo("");
    setDataInicio("");
    setDataFim("");
  }

  function resetarPaginacao() {
    setCursorAtual(undefined);
    setCursoresAnteriores([]);
  }

  function avancarPagina() {
    if (!data?.proximo_cursor || isFetching) return;
    setCursoresAnteriores((atuais) => [...atuais, cursorAtual]);
    setCursorAtual(data.proximo_cursor);
  }

  function voltarPagina() {
    if (cursoresAnteriores.length === 0 || isFetching) return;
    setCursorAtual(cursoresAnteriores.at(-1));
    setCursoresAnteriores((atuais) => atuais.slice(0, -1));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Movimentações de estoque"
        descricao="Histórico único das entradas, saídas e ajustes de matérias-primas e produtos."
      />

      <section
        aria-label="Filtros do histórico"
        className="rounded-lg border border-border bg-surface p-4 shadow-card"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-48">
            <Select
              id="movimentacoes-item-tipo"
              label="Tipo de item"
              value={itemTipo}
              onChange={(evento) => {
                resetarPaginacao();
                setItemTipo(evento.target.value as MovimentacaoItemTipo | "");
                setItemId("");
              }}
            >
              <option value="">Todos os itens</option>
              <option value="materia_prima">Matérias-primas</option>
              <option value="produto">Produtos</option>
            </Select>
          </div>
          <div className="w-full sm:min-w-64 sm:flex-1">
            <Select
              id="movimentacoes-item"
              label="Item específico"
              value={itemId}
              disabled={!itemTipo}
              onChange={(evento) => {
                resetarPaginacao();
                setItemId(evento.target.value);
              }}
            >
              <option value="">{itemTipo ? "Todos deste tipo" : "Escolha o tipo primeiro"}</option>
              {opcoesItem?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.codigo} · {"nome_tecido" in item ? item.nome_tecido : item.nome}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-56">
            <Select
              id="movimentacoes-tipo"
              label="Tipo de movimentação"
              value={tipo}
              onChange={(evento) => {
                resetarPaginacao();
                setTipo(evento.target.value as MovimentacaoTipo | "");
              }}
            >
              <option value="">Todos os movimentos</option>
              {TIPOS_MOVIMENTACAO.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {MOVIMENTACAO_TIPO_LABEL[opcao]}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Input
              id="movimentacoes-data-inicio"
              label="Desde"
              type="date"
              value={dataInicio}
              max={dataFim || undefined}
              onChange={(evento) => {
                resetarPaginacao();
                setDataInicio(evento.target.value);
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <Input
              id="movimentacoes-data-fim"
              label="Até"
              type="date"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(evento) => {
                resetarPaginacao();
                setDataFim(evento.target.value);
              }}
            />
          </div>
          {temFiltro && (
            <Button variant="secondary" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      </section>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar as movimentações.")}
          onRetry={() => void refetch()}
        />
      ) : data.itens.length === 0 ? (
        <EmptyState
          titulo={temFiltro ? "Nenhuma movimentação para este filtro" : "Nenhuma movimentação registrada"}
          descricao={
            temFiltro
              ? "Ajuste ou limpe os filtros para consultar outro período ou item."
              : "As entradas e saídas aparecerão aqui conforme o estoque for movimentado."
          }
          action={temFiltro ? <Button onClick={limparFiltros}>Limpar filtros</Button> : undefined}
        />
      ) : (
        <>
          <ResponsiveTable
            items={data.itens}
            columns={colunas}
            getRowKey={(movimento) => movimento.id}
            caption="Histórico de movimentações de estoque"
            mobileCard={(movimento) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <LinkItem movimento={movimento} />
                  <Quantidade movimento={movimento} />
                </div>
                <p className="text-sm text-body">{MOVIMENTACAO_TIPO_LABEL[movimento.tipo]}</p>
                <p className="text-sm text-body">
                  Saldo: {formatarQuantidade(movimento.saldo_resultante, movimento.item_unidade_medida)}
                </p>
                <p className="text-sm text-body">
                  <Referencia movimento={movimento} /> · {movimento.usuario_nome}
                </p>
                <p className="text-xs tabular-nums text-muted">
                  {formatarDataHoraCompleta(movimento.criado_em)}
                </p>
              </div>
            )}
          />

          <nav aria-label="Paginação das movimentações" className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              disabled={cursoresAnteriores.length === 0 || isFetching}
              onClick={voltarPagina}
            >
              Anterior
            </Button>
            <p aria-live="polite" className="text-sm text-muted">
              Página {cursoresAnteriores.length + 1}
              {isFetching ? " · Atualizando…" : ""}
            </p>
            <Button variant="secondary" disabled={!data.proximo_cursor || isFetching} onClick={avancarPagina}>
              Próxima
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
