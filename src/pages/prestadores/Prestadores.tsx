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
import { useDeactivatePrestador, usePrestadores, useUpdatePrestador } from "../../hooks/usePrestadores";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import type { Prestador } from "../../types/prestador";
import { TIPO_SERVICO_PRESTADOR_LABEL } from "../../types/prestador";
import { ServicoExternoTabs } from "../servicos-externos/ServicoExternoTabs";
import { PrestadorForm } from "./PrestadorForm";

type FormAberto = { modo: "criar" } | { modo: "editar"; prestador: Prestador } | null;

interface AcoesLinhaProps {
  prestador: Prestador;
  confirmando: boolean;
  desativando: boolean;
  onEditar: () => void;
  onIniciarDesativacao: () => void;
  onConfirmarDesativacao: () => void;
  onCancelarDesativacao: () => void;
}

function AcoesLinha({
  prestador,
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
          aria-label={`Confirmar desativação de ${prestador.nome}`}
        >
          Sim
        </Button>
        <Button
          variant="secondary"
          className="min-h-9 px-2 py-1"
          onClick={onCancelarDesativacao}
          disabled={desativando}
          aria-label={`Cancelar desativação de ${prestador.nome}`}
        >
          Não
        </Button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${prestador.nome}`}>
        Editar
      </Button>
      <Button variant="ghost-danger" onClick={onIniciarDesativacao} aria-label={`Desativar ${prestador.nome}`}>
        Desativar
      </Button>
    </span>
  );
}

function tiposServicoTexto(prestador: Prestador): string {
  return prestador.tipos_servico.map((tipo) => TIPO_SERVICO_PRESTADOR_LABEL[tipo]).join(", ") || "—";
}

export function Prestadores() {
  useDocumentTitle("Prestadores");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [formAberto, setFormAberto] = useState<FormAberto>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ mensagem: string; desfazerId?: string } | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const { data: prestadores, isPending, isError, error, refetch } = usePrestadores(buscaDebounced);
  const desativar = useDeactivatePrestador();
  const atualizar = useUpdatePrestador();

  function abrirCriacao() {
    setAviso(null);
    setErroAcao(null);
    setFormAberto({ modo: "criar" });
  }

  function abrirEdicao(prestador: Prestador) {
    setAviso(null);
    setErroAcao(null);
    setConfirmandoId(null);
    setFormAberto({ modo: "editar", prestador });
  }

  function aoSalvar(prestador: Prestador) {
    const editou = formAberto?.modo === "editar";
    setFormAberto(null);
    setAviso({
      mensagem: editou ? `Prestador "${prestador.nome}" atualizado.` : `Prestador "${prestador.nome}" cadastrado.`,
    });
  }

  async function confirmarDesativacao(prestador: Prestador) {
    setErroAcao(null);
    try {
      await desativar.mutateAsync(prestador.id);
      setConfirmandoId(null);
      setAviso({ mensagem: `Prestador "${prestador.nome}" desativado.`, desfazerId: prestador.id });
    } catch (error) {
      setConfirmandoId(null);
      setErroAcao(getApiErrorMessage(error, "Não foi possível desativar o prestador."));
    }
  }

  async function desfazerDesativacao(id: string) {
    setErroAcao(null);
    try {
      await atualizar.mutateAsync({ id, input: { ativo: true } });
      setAviso(null);
    } catch (error) {
      setErroAcao(getApiErrorMessage(error, "Não foi possível reativar o prestador."));
    }
  }

  function renderAcoes(prestador: Prestador) {
    return (
      <AcoesLinha
        prestador={prestador}
        confirmando={confirmandoId === prestador.id}
        desativando={desativar.isPending && desativar.variables === prestador.id}
        onEditar={() => abrirEdicao(prestador)}
        onIniciarDesativacao={() => {
          setAviso(null);
          setConfirmandoId(prestador.id);
        }}
        onConfirmarDesativacao={() => void confirmarDesativacao(prestador)}
        onCancelarDesativacao={() => setConfirmandoId(null)}
      />
    );
  }

  const colunas: Coluna<Prestador>[] = [
    { header: "Nome", cell: (p) => <span className="font-medium text-ink">{p.nome}</span> },
    { header: "Tipos de serviço", cell: tiposServicoTexto },
    { header: "Contato", cell: (p) => p.contato ?? "—" },
    { header: "Telefone", cell: (p) => p.telefone ?? "—" },
    { header: "Ações", alignRight: true, cell: renderAcoes },
  ];

  const temBusca = buscaDebounced.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Prestadores"
        descricao="Costureiras externas, silks e bordadeiras que prestam serviços externos."
        action={formAberto === null && <Button onClick={abrirCriacao}>Novo prestador</Button>}
      />

      <ServicoExternoTabs />

      {formAberto && (
        <PrestadorForm
          prestador={formAberto.modo === "editar" ? formAberto.prestador : undefined}
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
          id="busca-prestador"
          label="Buscar prestador por nome"
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
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os prestadores.")}
          onRetry={() => void refetch()}
        />
      ) : prestadores.length === 0 ? (
        temBusca ? (
          <EmptyState
            titulo={`Nada encontrado para "${buscaDebounced.trim()}"`}
            descricao="Confira a grafia ou limpe a busca para ver todos os prestadores."
          />
        ) : (
          <EmptyState
            titulo="Nenhum prestador ainda"
            descricao="Prestadores são as costureiras externas, silks e bordadeiras que prestam serviços externos. Cadastre o primeiro para poder enviar produções para eles."
            action={<Button onClick={abrirCriacao}>Cadastrar o primeiro prestador</Button>}
          />
        )
      ) : (
        <ResponsiveTable
          items={prestadores}
          columns={colunas}
          getRowKey={(p) => p.id}
          caption="Lista de prestadores ativos"
          mobileCard={(p) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">{p.nome}</p>
              <p className="text-sm text-body">{tiposServicoTexto(p)}</p>
              {p.contato && <p className="text-sm text-body">{p.contato}</p>}
              {p.telefone && <p className="text-sm text-body">{p.telefone}</p>}
              <div className="pt-2">{renderAcoes(p)}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}
