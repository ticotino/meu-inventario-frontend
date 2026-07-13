import { useState } from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "../../components/ui/formStyles";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { Select } from "../../components/ui/Select";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFabricantes } from "../../hooks/useFabricantes";
import { useMateriasPrimas } from "../../hooks/useMateriasPrimas";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import type { MateriaPrima } from "../../types/materiaPrima";
import { formatarData, formatarQuantidade } from "../../utils/format";

type FiltroStatus = "ativas" | "inativas" | "todas";

const STATUS_PARA_ATIVO: Record<FiltroStatus, boolean | undefined> = {
  ativas: true,
  inativas: false,
  todas: undefined,
};

export function MateriasPrimas() {
  useDocumentTitle("Matérias-primas");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [fabricanteId, setFabricanteId] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("ativas");

  const filtros = {
    busca: buscaDebounced,
    fabricanteId: fabricanteId || undefined,
    ativo: STATUS_PARA_ATIVO[status],
  };

  const { data: materiasPrimas, isPending, isError, error, refetch } = useMateriasPrimas(filtros);
  const { data: fabricantes } = useFabricantes();

  const colunas: Coluna<MateriaPrima>[] = [
    {
      header: "Código",
      cell: (mp) => (
        <Link to={`/materias-primas/${mp.id}`} className="font-medium tabular-nums text-action hover:underline">
          {mp.codigo}
        </Link>
      ),
    },
    {
      header: "Tecido",
      cell: (mp) => (
        <span>
          <span className="block font-medium text-ink">{mp.nome_tecido}</span>
          {mp.cor && <span className="block text-xs text-muted">{mp.cor}</span>}
        </span>
      ),
    },
    { header: "Fabricante", cell: (mp) => mp.fabricante_nome },
    {
      header: "Saldo",
      alignRight: true,
      cell: (mp) => (
        <span className="tabular-nums">
          {formatarQuantidade(mp.quantidade_disponivel, mp.unidade_medida)}
          {!mp.ativo && <span className="block text-xs text-muted">Inativa</span>}
        </span>
      ),
    },
    { header: "Recebido em", cell: (mp) => formatarData(mp.data_recebimento) },
    {
      header: "Ações",
      alignRight: true,
      cell: (mp) => (
        <Link to={`/materias-primas/${mp.id}`} className="text-sm font-medium text-action hover:underline">
          Detalhes
        </Link>
      ),
    },
  ];

  const temFiltro = buscaDebounced.trim().length > 0 || fabricanteId !== "" || status !== "ativas";
  const semFabricantes = fabricantes !== undefined && fabricantes.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Matérias-primas"
        descricao="Estoque de tecidos e insumos recebidos dos fabricantes."
        action={
          <Link to="/materias-primas/nova" className={buttonClasses("primary")}>
            Nova matéria-prima
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="max-w-xs flex-1">
          <Input
            id="busca-materia-prima"
            label="Buscar por tecido ou código"
            hideLabel
            type="search"
            placeholder="Buscar por tecido ou código"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="max-w-56 flex-1">
          <Select
            id="filtro-fabricante"
            label="Filtrar por fabricante"
            hideLabel
            value={fabricanteId}
            onChange={(e) => setFabricanteId(e.target.value)}
          >
            <option value="">Todos os fabricantes</option>
            {fabricantes?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </Select>
        </div>
        <div className="max-w-36 flex-1">
          <Select
            id="filtro-status"
            label="Filtrar por status"
            hideLabel
            value={status}
            onChange={(e) => setStatus(e.target.value as FiltroStatus)}
          >
            <option value="ativas">Ativas</option>
            <option value="inativas">Inativas</option>
            <option value="todas">Todas</option>
          </Select>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar as matérias-primas.")}
          onRetry={() => void refetch()}
        />
      ) : materiasPrimas.length === 0 ? (
        temFiltro ? (
          <EmptyState
            titulo="Nada encontrado com esses filtros"
            descricao="Ajuste a busca ou os filtros para ver outras matérias-primas."
          />
        ) : (
          <EmptyState
            titulo="Nenhuma matéria-prima registrada"
            descricao={
              semFabricantes ? (
                <>
                  Registre a chegada de um tecido para começar a controlar o estoque. Antes, cadastre um{" "}
                  <Link to="/fabricantes" className="font-medium text-action hover:underline">
                    fabricante
                  </Link>
                  .
                </>
              ) : (
                "Registre a chegada de um tecido para começar a controlar o estoque. O código MP- e o saldo são gerados automaticamente."
              )
            }
            action={
              !semFabricantes && (
                <Link to="/materias-primas/nova" className={buttonClasses("primary")}>
                  Registrar entrada
                </Link>
              )
            }
          />
        )
      ) : (
        <ResponsiveTable
          items={materiasPrimas}
          columns={colunas}
          getRowKey={(mp) => mp.id}
          caption="Lista de matérias-primas"
          mobileCard={(mp) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{mp.codigo}</span> · {mp.nome_tecido}
                {mp.cor && <span className="text-muted"> ({mp.cor})</span>}
              </p>
              <p className="text-sm text-body">{mp.fabricante_nome}</p>
              <p className="text-sm text-body tabular-nums">
                Saldo: {formatarQuantidade(mp.quantidade_disponivel, mp.unidade_medida)}
                {!mp.ativo && <span className="text-muted"> · Inativa</span>}
              </p>
              <div className="pt-1">
                <Link to={`/materias-primas/${mp.id}`} className="text-sm font-medium text-action hover:underline">
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
