import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { Select } from "../../components/ui/Select";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses } from "../../components/ui/formStyles";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useProdutos } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";
import type { Produto } from "../../types/produto";
import { formatarDataHora, formatarQuantidade } from "../../utils/format";
import { ProducaoTabs } from "./ProducaoTabs";

type FiltroStatus = "ativos" | "inativos" | "todos";

const STATUS_PARA_ATIVO: Record<FiltroStatus, boolean | undefined> = {
  ativos: true,
  inativos: false,
  todos: undefined,
};

export function Produtos() {
  useDocumentTitle("Produtos");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [status, setStatus] = useState<FiltroStatus>("ativos");

  const { data: produtos, isPending, isError, error, refetch } = useProdutos({
    busca: buscaDebounced,
    ativo: STATUS_PARA_ATIVO[status],
  });

  const colunas: Coluna<Produto>[] = [
    {
      header: "Código",
      cell: (p) => (
        <Link to={`/producao/produtos/${p.id}`} className="font-medium tabular-nums text-action hover:underline">
          {p.codigo}
        </Link>
      ),
    },
    { header: "Nome", cell: (p) => <span className="font-medium text-ink">{p.nome}</span> },
    {
      header: "Saldo",
      alignRight: true,
      cell: (p) => (
        <span className="tabular-nums">
          {formatarQuantidade(p.quantidade_disponivel, "unidade")}
          {!p.ativo && <span className="block text-xs text-muted">Inativo</span>}
        </span>
      ),
    },
    { header: "Criado em", cell: (p) => formatarDataHora(p.criado_em) },
    {
      header: "Ações",
      alignRight: true,
      cell: (p) => (
        <Link to={`/producao/produtos/${p.id}`} className="text-sm font-medium text-action hover:underline">
          Detalhes
        </Link>
      ),
    },
  ];

  const temFiltro = buscaDebounced.trim().length > 0 || status !== "ativos";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Produção"
        descricao="Produtos acabados e o estoque disponível de cada um."
        action={
          <Link to="/producao/produtos/novo" className={buttonClasses("primary")}>
            Novo produto
          </Link>
        }
      />

      <ProducaoTabs />

      <div className="flex flex-wrap gap-3">
        <div className="max-w-xs flex-1">
          <Input
            id="busca-produto"
            label="Buscar por nome ou código"
            hideLabel
            type="search"
            placeholder="Buscar por nome ou código"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="max-w-36 flex-1">
          <Select
            id="filtro-status-produto"
            label="Filtrar por status"
            hideLabel
            value={status}
            onChange={(e) => setStatus(e.target.value as FiltroStatus)}
          >
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
            <option value="todos">Todos</option>
          </Select>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os produtos.")}
          onRetry={() => void refetch()}
        />
      ) : produtos.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nada encontrado com esses filtros"
            descricao="Ajuste a busca ou os filtros para ver outros produtos."
          />
        ) : (
          <EmptyState
            titulo="Nenhum produto cadastrado"
            descricao="Produtos são as peças acabadas da oficina. Cadastre um produto para poder registrar produções e controlar o estoque acabado."
            action={
              <Link to="/producao/produtos/novo" className={buttonClasses("primary")}>
                Cadastrar o primeiro produto
              </Link>
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={produtos}
          columns={colunas}
          getRowKey={(p) => p.id}
          caption="Lista de produtos"
          mobileCard={(p) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{p.codigo}</span> · {p.nome}
              </p>
              <p className="text-sm text-body tabular-nums">
                Saldo: {formatarQuantidade(p.quantidade_disponivel, "unidade")}
                {!p.ativo && <span className="text-muted"> · Inativo</span>}
              </p>
              <div className="pt-1">
                <Link to={`/producao/produtos/${p.id}`} className="text-sm font-medium text-action hover:underline">
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
