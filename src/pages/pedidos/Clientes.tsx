import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ConfirmInline } from "../../components/ui/ConfirmInline";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { ResultsAnnouncer } from "../../components/ui/ResultsAnnouncer";
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
  desativando: boolean;
  onEditar: () => void;
  onDesativar: () => Promise<void>;
}

function AcoesLinha({ cliente, desativando, onEditar, onDesativar }: AcoesLinhaProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${cliente.nome}`}>
        Editar
      </Button>
      <ConfirmInline
        triggerLabel="Desativar"
        triggerAriaLabel={`Desativar ${cliente.nome}`}
        triggerVariant="ghost-danger"
        question="Desativar?"
        confirmAriaLabel={`Confirmar desativação de ${cliente.nome}`}
        cancelAriaLabel={`Cancelar desativação de ${cliente.nome}`}
        danger
        loading={desativando}
        onConfirm={onDesativar}
      />
    </span>
  );
}

export function Clientes() {
  useDocumentTitle("Clientes");
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebouncedValue(busca, 300);
  const [formAberto, setFormAberto] = useState<FormAberto>(null);
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
    setFormAberto({ modo: "editar", cliente });
  }

  function aoSalvar(cliente: Cliente) {
    const editou = formAberto?.modo === "editar";
    setFormAberto(null);
    setAviso({ mensagem: editou ? `Cliente "${cliente.nome}" atualizado.` : `Cliente "${cliente.nome}" cadastrado.` });
  }

  async function confirmarDesativacao(cliente: Cliente) {
    setAviso(null);
    setErroAcao(null);
    try {
      await desativar.mutateAsync(cliente.id);
      setAviso({ mensagem: `Cliente "${cliente.nome}" desativado.`, desfazerId: cliente.id });
    } catch (error) {
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
        desativando={desativar.isPending && desativar.variables === cliente.id}
        onEditar={() => abrirEdicao(cliente)}
        onDesativar={() => confirmarDesativacao(cliente)}
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

      <ResultsAnnouncer
        count={clientes?.length ?? 0}
        singular="cliente"
        plural="clientes"
        genero="m"
        emptyMessage="Nenhum cliente encontrado"
        loading={isPending || isError}
      />

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
