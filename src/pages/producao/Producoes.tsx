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
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useProducoes } from "../../hooks/useProducoes";
import { useProdutos } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";
import type { Producao } from "../../types/producao";
import { formatarData, formatarQuantidade } from "../../utils/format";
import { ProducaoTabs } from "./ProducaoTabs";

export function Producoes() {
  useDocumentTitle("Produções");
  const [produtoId, setProdutoId] = useState("");

  const { data: producoes, isPending, isError, error, refetch } = useProducoes({
    produtoId: produtoId || undefined,
  });
  const { data: produtos } = useProdutos({});

  const colunas: Coluna<Producao>[] = [
    {
      header: "Código",
      cell: (pr) => (
        <Link to={`/producao/${pr.id}`} className="font-medium tabular-nums text-action hover:underline">
          {pr.codigo}
        </Link>
      ),
    },
    {
      header: "Produto",
      cell: (pr) => (
        <span>
          <span className="block font-medium text-ink">{pr.produto_nome}</span>
          <span className="block text-xs tabular-nums text-muted">{pr.produto_codigo}</span>
        </span>
      ),
    },
    {
      header: "Quantidade",
      alignRight: true,
      cell: (pr) => <span className="tabular-nums">{formatarQuantidade(pr.quantidade_produzida, "unidade")}</span>,
    },
    { header: "Data", cell: (pr) => formatarData(pr.data_producao) },
    { header: "Registrado por", cell: (pr) => pr.usuario_nome },
    {
      header: "Ações",
      alignRight: true,
      cell: (pr) => (
        <Link to={`/producao/${pr.id}`} className="text-sm font-medium text-action hover:underline">
          Detalhes
        </Link>
      ),
    },
  ];

  const temFiltro = produtoId !== "";
  const semProdutos = produtos !== undefined && produtos.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Produção"
        descricao="Registro das produções: o que foi produzido e quais matérias-primas foram consumidas."
        action={
          <Link to="/producao/nova" className={buttonClasses("primary")}>
            Registrar produção
          </Link>
        }
      />

      <ProducaoTabs />

      <div className="max-w-56">
        <Select
          id="filtro-producao-produto"
          label="Filtrar por produto"
          hideLabel
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
        >
          <option value="">Todos os produtos</option>
          {produtos?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Select>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar as produções.")}
          onRetry={() => void refetch()}
        />
      ) : producoes.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nenhuma produção para este produto"
            descricao="Limpe o filtro para ver todas as produções registradas."
          />
        ) : (
          <EmptyState
            titulo="Nenhuma produção registrada"
            descricao={
              semProdutos ? (
                <>
                  Registrar uma produção dá entrada no estoque de produtos acabados e baixa as matérias-primas
                  consumidas. Antes, cadastre um{" "}
                  <Link to="/producao/produtos/novo" className="font-medium text-action hover:underline">
                    produto
                  </Link>
                  .
                </>
              ) : (
                "Registrar uma produção dá entrada no estoque do produto acabado e baixa as matérias-primas consumidas."
              )
            }
            action={
              !semProdutos && (
                <Link to="/producao/nova" className={buttonClasses("primary")}>
                  Registrar a primeira produção
                </Link>
              )
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={producoes}
          columns={colunas}
          getRowKey={(pr) => pr.id}
          caption="Registro de produções"
          mobileCard={(pr) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{pr.codigo}</span> · {pr.produto_nome}
              </p>
              <p className="text-sm text-body tabular-nums">
                {formatarQuantidade(pr.quantidade_produzida, "unidade")} em {formatarData(pr.data_producao)}
              </p>
              <p className="text-sm text-muted">{pr.usuario_nome}</p>
              <div className="pt-1">
                <Link to={`/producao/${pr.id}`} className="text-sm font-medium text-action hover:underline">
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
