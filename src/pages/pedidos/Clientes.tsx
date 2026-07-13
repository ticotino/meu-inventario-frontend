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
import { useClientes, useDeactivateCliente, useUpdateCliente } from "../../hooks/useClientes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import type { Cliente } from "../../types/cliente";
import { ClienteForm } from "./ClienteForm";
import { PedidosTabs } from "./PedidosTabs";

type FormAberto = { modo: "criar" } | { modo: "editar"; cliente: Cliente } | null;

interface AcoesLinhaProps {
  cliente: Cliente;
  confirmando: boolean;
  desativando: boolean;
  onEditar: () => void;
  onIniciarDesativacao: () => void;
  onConfirmarDesativacao: () => void;
  onCancelarDesativacao: () => void;
}

function AcoesLinha({
  cliente,
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
          aria-label={`Confirmar desativação de ${cliente.nome}`}
        >
          Sim
        </Button>
        <Button
          variant="secondary"
          className="min-h-9 px-2 py-1"
          onClick={onCancelarDesativacao}
          disabled={desativando}
          aria-label={`Cancelar desativação de ${cliente.nome}`}
        >
          Não
        </Button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${cliente.nome}`}>
        Editar
      </Button>
      <Button variant="ghost-danger" onClick={onIniciarDesativacao} aria-label={`Desativar ${cliente.nome}`}>
        Desativar
      </Button>
    </span>
  );
}

export function Clientes() {
  useDocumentTitle("Clientes");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [formAberto, setFormAberto] = useState<FormAberto>(null);
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ mensagem: string; desfazerId?: string } | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const { data: clientes, isPending, isError, error, refetch } = useClientes(buscaDebounced);
  const desativar = useDeactivateCliente();
  const atualizar = useUpdateCliente();

  function abrirCriacao() {
    setAviso(null);
    setErroAcao(null);
    setFormAberto({ modo: "criar" });
  }

  function abrirEdicao(cliente: Cliente) {
    setAviso(null);
    setErroAcao(null);
    setConfirmandoId(null);
    setFormAberto({ modo: "editar", cliente });
  }

  function aoSalvar(cliente: Cliente) {
    const editou = formAberto?.modo === "editar";
    setFormAberto(null);
    setAviso({ mensagem: editou ? `Cliente "${cliente.nome}" atualizado.` : `Cliente "${cliente.nome}" cadastrado.` });
  }

  async function confirmarDesativacao(cliente: Cliente) {
    setErroAcao(null);
    try {
      await desativar.mutateAsync(cliente.id);
      setConfirmandoId(null);
      setAviso({ mensagem: `Cliente "${cliente.nome}" desativado.`, desfazerId: cliente.id });
    } catch (error) {
      setConfirmandoId(null);
      setErroAcao(getApiErrorMessage(error, "Não foi possível desativar o cliente."));
    }
  }

  async function desfazerDesativacao(id: string) {
    setErroAcao(null);
    try {
      await atualizar.mutateAsync({ id, input: { ativo: true } });
      setAviso(null);
    } catch (error) {
      setErroAcao(getApiErrorMessage(error, "Não foi possível reativar o cliente."));
    }
  }

  function renderAcoes(cliente: Cliente) {
    return (
      <AcoesLinha
        cliente={cliente}
        confirmando={confirmandoId === cliente.id}
        desativando={desativar.isPending && desativar.variables === cliente.id}
        onEditar={() => abrirEdicao(cliente)}
        onIniciarDesativacao={() => {
          setAviso(null);
          setConfirmandoId(cliente.id);
        }}
        onConfirmarDesativacao={() => void confirmarDesativacao(cliente)}
        onCancelarDesativacao={() => setConfirmandoId(null)}
      />
    );
  }

  const colunas: Coluna<Cliente>[] = [
    { header: "Nome", cell: (c) => <span className="font-medium text-ink">{c.nome}</span> },
    { header: "Contato", cell: (c) => c.contato ?? "—" },
    { header: "Telefone", cell: (c) => c.telefone ?? "—" },
    { header: "E-mail", cell: (c) => c.email ?? "—" },
    { header: "Ações", alignRight: true, cell: renderAcoes },
  ];

  const temBusca = buscaDebounced.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Clientes"
        descricao="Cadastro de clientes para quem os pedidos são registrados."
        action={formAberto === null && <Button onClick={abrirCriacao}>Novo cliente</Button>}
      />

      <PedidosTabs />

      {formAberto && (
        <ClienteForm
          cliente={formAberto.modo === "editar" ? formAberto.cliente : undefined}
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
          id="busca-cliente"
          label="Buscar cliente por nome"
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
          mensagem={getApiErrorMessage(error, "Não foi possível carregar os clientes.")}
          onRetry={() => void refetch()}
        />
      ) : clientes.length === 0 ? (
        temBusca ? (
          <EmptyState
            titulo={`Nada encontrado para "${buscaDebounced.trim()}"`}
            descricao="Confira a grafia ou limpe a busca para ver todos os clientes."
          />
        ) : (
          <EmptyState
            titulo="Nenhum cliente ainda"
            descricao="Clientes são para quem os pedidos são registrados. Cadastre o primeiro para poder registrar um pedido."
            action={<Button onClick={abrirCriacao}>Cadastrar o primeiro cliente</Button>}
          />
        )
      ) : (
        <ResponsiveTable
          items={clientes}
          columns={colunas}
          getRowKey={(c) => c.id}
          caption="Lista de clientes ativos"
          mobileCard={(c) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">{c.nome}</p>
              {c.contato && <p className="text-sm text-body">{c.contato}</p>}
              {c.telefone && <p className="text-sm text-body">{c.telefone}</p>}
              {c.email && <p className="text-sm text-body">{c.email}</p>}
              <div className="pt-2">{renderAcoes(c)}</div>
            </div>
          )}
        />
      )}
    </div>
  );
}
