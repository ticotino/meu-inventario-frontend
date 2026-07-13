import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeactivateFabricante, useFabricantes, useUpdateFabricante } from "../../hooks/useFabricantes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import type { Fabricante } from "../../types/fabricante";
import { FabricanteForm } from "./FabricanteForm";

type FormAberto = { modo: "criar" } | { modo: "editar"; fabricante: Fabricante } | null;

interface AcoesLinhaProps {
  fabricante: Fabricante;
  confirmando: boolean;
  desativando: boolean;
  onEditar: () => void;
  onIniciarDesativacao: () => void;
  onConfirmarDesativacao: () => void;
  onCancelarDesativacao: () => void;
}

function AcoesLinha({
  fabricante,
  confirmando,
  desativando,
  onEditar,
  onIniciarDesativacao,
  onConfirmarDesativacao,
  onCancelarDesativacao,
}: AcoesLinhaProps) {
  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-body">
        Desativar?
        <Button
          variant="danger"
          className="min-h-9 px-2 py-1"
          onClick={onConfirmarDesativacao}
          disabled={desativando}
          loading={desativando}
          loadingText="..."
          aria-label={`Confirmar desativação de ${fabricante.nome}`}
        >
          Sim
        </Button>
        <Button
          variant="secondary"
          className="min-h-9 px-2 py-1"
          onClick={onCancelarDesativacao}
          disabled={desativando}
          aria-label={`Cancelar desativação de ${fabricante.nome}`}
        >
          Não
        </Button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${fabricante.nome}`}>
        Editar
      </Button>
      <Button variant="ghost-danger" onClick={onIniciarDesativacao} aria-label={`Desativar ${fabricante.nome}`}>
        Desativar
      </Button>
    </span>
  );
}

export function Fabricantes() {
  useDocumentTitle("Fabricantes");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [formAberto, setFormAberto] = useState<FormAberto>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ mensagem: string; desfazerId?: string } | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const { data: fabricantes, isPending, isError, error, refetch } = useFabricantes(buscaDebounced);
  const desativar = useDeactivateFabricante();
  const atualizar = useUpdateFabricante();

  function abrirCriacao() {
    setAviso(null);
    setErroAcao(null);
    setFormAberto({ modo: "criar" });
  }

  function abrirEdicao(fabricante: Fabricante) {
    setAviso(null);
    setErroAcao(null);
    setConfirmandoId(null);
    setFormAberto({ modo: "editar", fabricante });
  }

  function aoSalvar(fabricante: Fabricante) {
    const editou = formAberto?.modo === "editar";
    setFormAberto(null);
    setAviso({ mensagem: editou ? `Fabricante "${fabricante.nome}" atualizado.` : `Fabricante "${fabricante.nome}" cadastrado.` });
  }

  async function confirmarDesativacao(fabricante: Fabricante) {
    setErroAcao(null);
    try {
      await desativar.mutateAsync(fabricante.id);
      setConfirmandoId(null);
      setAviso({ mensagem: `Fabricante "${fabricante.nome}" desativado.`, desfazerId: fabricante.id });
    } catch (error) {
      setConfirmandoId(null);
      setErroAcao(getApiErrorMessage(error, "Não foi possível desativar o fabricante."));
    }
  }

  async function desfazerDesativacao(id: string) {
    setErroAcao(null);
    try {
      await atualizar.mutateAsync({ id, input: { ativo: true } });
      setAviso(null);
    } catch (error) {
      setErroAcao(getApiErrorMessage(error, "Não foi possível reativar o fabricante."));
    }
  }

  function renderAcoes(fabricante: Fabricante) {
    return (
      <AcoesLinha
        fabricante={fabricante}
        confirmando={confirmandoId === fabricante.id}
        desativando={desativar.isPending && desativar.variables === fabricante.id}
        onEditar={() => abrirEdicao(fabricante)}
        onIniciarDesativacao={() => {
          setAviso(null);
          setConfirmandoId(fabricante.id);
        }}
        onConfirmarDesativacao={() => void confirmarDesativacao(fabricante)}
        onCancelarDesativacao={() => setConfirmandoId(null)}
      />
    );
  }

  const colunas: Coluna<Fabricante>[] = [
    { header: "Nome", cell: (f) => <span className="font-medium text-ink">{f.nome}</span> },
    { header: "Contato", cell: (f) => f.contato ?? "—" },
    { header: "Telefone", cell: (f) => f.telefone ?? "—" },
    { header: "E-mail", cell: (f) => f.email ?? "—" },
    { header: "Ações", alignRight: true, cell: renderAcoes },
  ];

  const temBusca = buscaDebounced.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Fabricantes"
        descricao="Fornecedores dos tecidos e insumos da oficina."
        action={formAberto === null && <Button onClick={abrirCriacao}>Novo fabricante</Button>}
      />

      {formAberto && (
        <FabricanteForm
          fabricante={formAberto.modo === "editar" ? formAberto.fabricante : undefined}
          onSuccess={aoSalvar}
          onCancel={() => setFormAberto(null)}
        />
      )}

      {aviso && (
        <SuccessBanner>
          {aviso.mensagem}{" "}
          {aviso.desfazerId && (
            <button
              type="button"
              disabled={atualizar.isPending}
              className="rounded font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void desfazerDesativacao(aviso.desfazerId!)}
            >
              {atualizar.isPending ? "Desfazendo..." : "Desfazer"}
            </button>
          )}
        </SuccessBanner>
      )}
      {erroAcao && <ErrorState mensagem={erroAcao} />}

      <div className="max-w-sm">
        <Input
          id="busca-fabricante"
          label="Buscar fabricante por nome"
          hideLabel
          type="search"
          placeholder="Buscar por nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os fabricantes.")}
          onRetry={() => void refetch()}
        />
      ) : fabricantes.length === 0 ? (
        temBusca ? (
          <EmptyState
            titulo={`Nada encontrado para "${buscaDebounced.trim()}"`}
            descricao="Confira a grafia ou limpe a busca para ver todos os fabricantes."
          />
        ) : (
          <EmptyState
            titulo="Nenhum fabricante ainda"
            descricao="Fabricantes são os fornecedores dos seus tecidos. Cadastre o primeiro para poder registrar matérias-primas."
            action={<Button onClick={abrirCriacao}>Cadastrar o primeiro fabricante</Button>}
          />
        )
      ) : (
        <ResponsiveTable
          items={fabricantes}
          columns={colunas}
          getRowKey={(f) => f.id}
          caption="Lista de fabricantes ativos"
          mobileCard={(f) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">{f.nome}</p>
              {f.contato && <p className="text-sm text-body">{f.contato}</p>}
              {f.telefone && <p className="text-sm text-body">{f.telefone}</p>}
              {f.email && <p className="text-sm text-body">{f.email}</p>}
              <div className="pt-2">{renderAcoes(f)}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}
