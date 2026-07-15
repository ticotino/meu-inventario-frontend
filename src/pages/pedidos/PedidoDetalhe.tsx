import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { PrintButton } from "../../components/ui/PrintButton";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { buttonClasses, feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  useAtenderPedido,
  useCancelarPedido,
  useFaturarPedido,
  usePedido,
  useUpdatePrazoPedido,
} from "../../hooks/usePedidos";
import { getApiErrorMessage } from "../../services/api";
import type { PedidoItem } from "../../types/pedido";
import { formatarData, formatarDataHora, formatarQuantidade } from "../../utils/format";
import { STATUS_PEDIDO_CLASS, STATUS_PEDIDO_LABEL } from "./statusPedido";

function ResumoItem({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd
        className={
          destaque ? "mt-0.5 text-2xl font-semibold tabular-nums text-ink" : "mt-0.5 text-sm text-body"
        }
      >
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

function PrazoPedido({
  pedidoId,
  dataPedido,
  dataPrevistaEntrega,
  situacaoPrazo,
  diasParaEntrega,
  editavel,
}: {
  pedidoId: string;
  dataPedido: string;
  dataPrevistaEntrega: string | null;
  situacaoPrazo: "sem_prazo" | "atrasado" | "vence_hoje" | "no_prazo";
  diasParaEntrega: number | null;
  editavel: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [prazo, setPrazo] = useState(dataPrevistaEntrega ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const atualizar = useUpdatePrazoPedido();

  async function salvar() {
    setErro(null);
    if (!prazo) {
      setErro("Informe o prazo de entrega.");
      return;
    }
    if (prazo < dataPedido) {
      setErro("O prazo não pode ser anterior à data do pedido.");
      return;
    }
    try {
      await atualizar.mutateAsync({ id: pedidoId, dataPrevistaEntrega: prazo });
      setEditando(false);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível atualizar o prazo."));
    }
  }

  if (!editando) {
    return (
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <dt className="text-xs text-muted">Prazo de entrega</dt>
          <dd className="mt-0.5 text-sm tabular-nums text-body">
            {dataPrevistaEntrega ? formatarData(dataPrevistaEntrega) : "Sem prazo cadastrado"}
          </dd>
          {editavel && situacaoPrazo !== "sem_prazo" && (
            <p
              className={`mt-0.5 text-xs ${situacaoPrazo === "atrasado" ? "font-medium text-danger" : "text-muted"}`}
            >
              {situacaoPrazo === "atrasado"
                ? `${Math.abs(diasParaEntrega ?? 0)} dia(s) em atraso`
                : situacaoPrazo === "vence_hoje"
                  ? "Vence hoje"
                  : `Faltam ${diasParaEntrega ?? 0} dia(s)`}
            </p>
          )}
        </div>
        {editavel && (
          <Button variant="ghost" className="min-h-11" data-print-hidden onClick={() => setEditando(true)}>
            Alterar prazo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-2 sm:col-span-3" data-print-hidden>
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-52">
          <Input
            id="pedido-editar-prazo"
            label="Novo prazo de entrega"
            type="date"
            required
            min={dataPedido}
            value={prazo}
            error={erro ?? undefined}
            onChange={(event) => {
              setPrazo(event.target.value);
              if (erro) setErro(null);
            }}
          />
        </div>
        <Button onClick={() => void salvar()} loading={atualizar.isPending} loadingText="Salvando...">
          Salvar prazo
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setPrazo(dataPrevistaEntrega ?? "");
            setErro(null);
            setEditando(false);
          }}
          disabled={atualizar.isPending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function AcoesStatus({ pedidoId, status }: { pedidoId: string; status: string }) {
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [confirmandoAtender, setConfirmandoAtender] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const atender = useAtenderPedido();
  const cancelar = useCancelarPedido();
  const faturar = useFaturarPedido();

  async function executar(acao: "atender" | "cancelar" | "faturar") {
    setErro(null);
    try {
      if (acao === "atender") await atender.mutateAsync(pedidoId);
      if (acao === "cancelar") await cancelar.mutateAsync(pedidoId);
      if (acao === "faturar") await faturar.mutateAsync(pedidoId);
      setConfirmandoCancelar(false);
      setConfirmandoAtender(false);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível atualizar o pedido."));
    }
  }

  if (status !== "pendente" && status !== "atendido") return null;

  return (
    <div className="space-y-2" data-print-hidden>
      <div className="flex flex-wrap items-center gap-2">
        {status === "pendente" && (
          <>
            <Link to={`/romaneios/novo?pedido=${pedidoId}`} className={buttonClasses("primary")}>
              Gerar romaneio
            </Link>
            {confirmandoAtender ? (
              <span className="inline-flex flex-wrap items-center gap-1 text-sm text-body">
                Atender sem romaneio? Depois não será mais possível gerar um.
                <Button
                  variant="secondary"
                  className="min-h-9 px-2 py-1"
                  onClick={() => void executar("atender")}
                  disabled={cancelar.isPending}
                  loading={atender.isPending}
                  loadingText="..."
                >
                  Sim
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-9 px-2 py-1"
                  onClick={() => setConfirmandoAtender(false)}
                  disabled={atender.isPending}
                >
                  Não
                </Button>
              </span>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setConfirmandoAtender(true)}
                disabled={cancelar.isPending}
              >
                Marcar como atendido
              </Button>
            )}
          </>
        )}
        {status === "atendido" && (
          <Button
            onClick={() => void executar("faturar")}
            loading={faturar.isPending}
            loadingText="Marcando..."
          >
            Marcar como faturado
          </Button>
        )}
        {status === "pendente" &&
          (confirmandoCancelar ? (
            <span className="inline-flex items-center gap-1 text-sm text-body">
              Cancelar pedido?
              <Button
                variant="danger"
                className="min-h-9 px-2 py-1"
                onClick={() => void executar("cancelar")}
                disabled={cancelar.isPending}
                loading={cancelar.isPending}
                loadingText="..."
              >
                Sim
              </Button>
              <Button
                variant="secondary"
                className="min-h-9 px-2 py-1"
                onClick={() => setConfirmandoCancelar(false)}
                disabled={cancelar.isPending}
              >
                Não
              </Button>
            </span>
          ) : (
            <Button
              variant="ghost-danger"
              onClick={() => setConfirmandoCancelar(true)}
              disabled={atender.isPending}
            >
              Cancelar pedido
            </Button>
          ))}
      </div>
      {erro && (
        <p role="alert" className={feedbackErrorClass}>
          {erro}
        </p>
      )}
    </div>
  );
}

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: pedido, isPending, isError, error, refetch } = usePedido(id);
  useDocumentTitle(pedido ? pedido.codigo : "Pedido");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar o pedido.")}
          onRetry={() => void refetch()}
        />
        <Link to="/pedidos" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar ao registro de pedidos
        </Link>
      </div>
    );
  }

  const colunas: Coluna<PedidoItem>[] = [
    { header: "Código", cell: (item) => <span className="tabular-nums">{item.codigo}</span> },
    { header: "Produto", cell: (item) => <span className="font-medium text-ink">{item.nome}</span> },
    {
      header: "Quantidade",
      alignRight: true,
      cell: (item) => <span className="tabular-nums">{formatarQuantidade(item.quantidade, "unidade")}</span>,
    },
  ];

  return (
    <div className="space-y-6" data-print-document>
      <PageHeader
        titulo={pedido.codigo}
        descricao={`Pedido de ${pedido.cliente_nome} em ${formatarData(pedido.data_pedido)}`}
        action={
          <div className="flex flex-wrap items-center gap-3" data-print-hidden>
            <PrintButton />
            <Link to="/pedidos" className="text-sm font-medium text-action hover:underline">
              Voltar ao registro
            </Link>
          </div>
        }
      />

      <div className="print-section rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Resumo</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResumoItem
            rotulo="Status"
            valor={
              <span className={STATUS_PEDIDO_CLASS[pedido.status]}>{STATUS_PEDIDO_LABEL[pedido.status]}</span>
            }
            destaque
          />
          <ResumoItem rotulo="Cliente" valor={pedido.cliente_nome} />
          <ResumoItem rotulo="Data do pedido" valor={formatarData(pedido.data_pedido)} />
          <PrazoPedido
            pedidoId={pedido.id}
            dataPedido={pedido.data_pedido}
            dataPrevistaEntrega={pedido.data_prevista_entrega}
            situacaoPrazo={pedido.situacao_prazo}
            diasParaEntrega={pedido.dias_para_entrega}
            editavel={pedido.status === "pendente"}
          />
          <ResumoItem rotulo="Registrado por" valor={pedido.usuario_nome} />
          {pedido.atendido_em && (
            <ResumoItem rotulo="Atendido em" valor={formatarDataHora(pedido.atendido_em)} />
          )}
          {pedido.faturado_em && (
            <ResumoItem rotulo="Faturado em" valor={formatarDataHora(pedido.faturado_em)} />
          )}
          {pedido.cancelado_em && (
            <ResumoItem rotulo="Cancelado em" valor={formatarDataHora(pedido.cancelado_em)} />
          )}
          {pedido.romaneio_id && (
            <ResumoItem
              rotulo="Romaneio"
              valor={
                <Link
                  to={`/romaneios/${pedido.romaneio_id}`}
                  className="font-medium tabular-nums text-action hover:underline"
                >
                  {pedido.romaneio_codigo}
                </Link>
              }
            />
          )}
        </dl>
        {pedido.observacoes && <p className="mt-4 text-sm text-body">{pedido.observacoes}</p>}
        <p className="mt-4 text-xs text-muted">
          Os itens do pedido são fixos no momento do registro — correções de estoque virão como ajustes.
        </p>

        <div className="mt-4">
          <AcoesStatus pedidoId={pedido.id} status={pedido.status} />
        </div>
      </div>

      <div className="print-section space-y-3">
        <h2 className="text-sm font-medium text-ink">Itens</h2>
        <ResponsiveTable
          items={pedido.itens}
          columns={colunas}
          getRowKey={(item) => item.produto_id}
          caption="Itens do pedido"
          mobileCard={(item) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{item.codigo}</span> · {item.nome}
              </p>
              <p className="text-sm text-body tabular-nums">
                {formatarQuantidade(item.quantidade, "unidade")}
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
}
