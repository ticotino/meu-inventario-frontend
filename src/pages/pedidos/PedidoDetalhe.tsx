import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ConfirmInline } from "../../components/ui/ConfirmInline";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { PrintButton } from "../../components/ui/PrintButton";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { buttonClasses, feedbackErrorClass } from "../../components/ui/formStyles";
import { useReservasPedido } from "../../hooks/useCompras";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  useAtenderPedido,
  useCancelarPedido,
  useExcluirPedido,
  useFaturarPedido,
  usePedido,
  useUpdatePrazoPedido,
} from "../../hooks/usePedidos";
import { useRomaneiosDetalhe } from "../../hooks/useRomaneios";
import { getApiErrorMessage } from "../../services/api";
import type { ReservaMateriaPrimaPedido } from "../../types/compra";
import type { PedidoItem } from "../../types/pedido";
import { formatarData, formatarDataHora, formatarQuantidade } from "../../utils/format";
import { STATUS_SERVICO_EXTERNO_CLASS, STATUS_SERVICO_EXTERNO_LABEL } from "../servicos-externos/statusServicoExterno";
import { TIPO_SERVICO_EXTERNO_LABEL } from "../servicos-externos/tipoServicoExterno";
import { somarEnviadoPorProduto } from "../romaneios/quantidadeEnviada";
import { algumItemComEnvioPendente } from "./parcialmenteAtendido";
import { STATUS_PEDIDO_CLASS, STATUS_PEDIDO_LABEL } from "./statusPedido";

// A instrução (descrição da peça) aparece sempre que existir, independente
// de acabamento externo. Já a seção de destino/serviço externo vinculado (tipo,
// imagem de referência, status do prestador) só aparece quando houver de fato
// um destino diferente de "nenhum" — item sem instrução e sem acabamento não
// ganha nenhuma seção extra, para evitar ruído visual (requisito do spec).
//
// Renomeado de `AcabamentoItem` para `DetalheItemPedido` durante o rename
// amplo de nomenclatura do serviço de acabamento externo (fase 5, tarefa
// 5.9): o nome antigo refletia só o caso de acabamento, mas o componente já
// cobre a instrução (descrição da peça) sempre, com ou sem acabamento.
function DetalheItemPedido({ item, pedidoId }: { item: PedidoItem; pedidoId: string }) {
  if (!item.instrucao && item.destino_servico_externo === "nenhum") return null;

  return (
    <div className="space-y-1 text-xs">
      {item.instrucao && <p className="text-body">{item.instrucao}</p>}
      {item.destino_servico_externo !== "nenhum" && (
        <>
          <p className="font-medium text-ink">{TIPO_SERVICO_EXTERNO_LABEL[item.destino_servico_externo]}</p>
          {item.imagem_referencia_url && (
            <a
              href={item.imagem_referencia_url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-action hover:underline"
            >
              Ver imagem de referência
            </a>
          )}
          {item.servico_externo ? (
            <p>
              <Link
                to={`/servicos-externos/${item.servico_externo.id}`}
                className="font-medium tabular-nums text-action hover:underline"
              >
                {item.servico_externo.codigo}
              </Link>{" "}
              ·{" "}
              <span className={STATUS_SERVICO_EXTERNO_CLASS[item.servico_externo.status]}>
                {STATUS_SERVICO_EXTERNO_LABEL[item.servico_externo.status]}
              </span>
            </p>
          ) : (
            <Link
              to={`/servicos-externos/novo?pedido=${pedidoId}&pedido_item=${item.id}`}
              className="font-medium text-action hover:underline"
              data-print-hidden
            >
              Enviar para serviço externo
            </Link>
          )}
        </>
      )}
    </div>
  );
}

// Quanto de um item já saiu da oficina, somando todos os romaneios do
// pedido — não é um badge novo, só texto simples no tom neutro/muted já
// usado para leitura (One Accent Rule: azul fica só para o que é clicável).
function SituacaoEnvioItem({
  item,
  enviadoPorProduto,
  carregando,
}: {
  item: PedidoItem;
  enviadoPorProduto: Map<string, number>;
  carregando: boolean;
}) {
  if (carregando) return <span className="text-xs text-muted">Carregando...</span>;

  const pedida = Number(item.quantidade);
  const enviado = enviadoPorProduto.get(item.produto_id) ?? 0;

  if (enviado <= 0) return <span className="text-xs text-muted">Ainda não enviado</span>;
  if (enviado + 0.0005 >= pedida) return <span className="text-xs text-ink">Enviado</span>;

  return (
    <span className="text-xs tabular-nums text-muted">
      {formatarQuantidade(enviado, "unidade")} de {formatarQuantidade(item.quantidade, "unidade")}
    </span>
  );
}

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

// Alvo de foco após ações que trocam o status: os gatilhos de confirmação saem
// da tela e o foco cairia no body sem um destino explícito.
const STATUS_PEDIDO_DOM_ID = "pedido-status-atual";

function AcoesStatus({ pedidoId, status }: { pedidoId: string; status: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const erroRef = useRef<HTMLParagraphElement>(null);
  const atender = useAtenderPedido();
  const cancelar = useCancelarPedido();
  const faturar = useFaturarPedido();

  useEffect(() => {
    if (erro) erroRef.current?.focus();
  }, [erro]);

  async function executar(acao: "atender" | "cancelar" | "faturar") {
    setErro(null);
    try {
      if (acao === "atender") await atender.mutateAsync(pedidoId);
      if (acao === "cancelar") await cancelar.mutateAsync(pedidoId);
      if (acao === "faturar") await faturar.mutateAsync(pedidoId);
      // O botão acionado deixa de existir quando o status muda; levamos o
      // foco para o status no resumo, que reflete o novo estado do pedido.
      document.getElementById(STATUS_PEDIDO_DOM_ID)?.focus();
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
            <ConfirmInline
              triggerLabel="Marcar como atendido"
              question="Atender sem romaneio? Depois não será mais possível gerar um."
              disabled={cancelar.isPending}
              loading={atender.isPending}
              restoreFocusOnConfirm={false}
              onConfirm={() => executar("atender")}
            />
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
        {status === "pendente" && (
          <ConfirmInline
            triggerLabel="Cancelar pedido"
            triggerVariant="ghost-danger"
            question="Cancelar pedido?"
            danger
            disabled={atender.isPending}
            loading={cancelar.isPending}
            restoreFocusOnConfirm={false}
            onConfirm={() => executar("cancelar")}
          />
        )}
      </div>
      {erro && (
        <p ref={erroRef} tabIndex={-1} role="alert" className={feedbackErrorClass}>
          {erro}
        </p>
      )}
    </div>
  );
}

// Exclusão definitiva do pedido — disponível em qualquer status (diferente de
// AcoesStatus, que só existe para pendente/atendido), por isso é um bloco
// próprio, separado por um divisor e com texto explicando o alcance da
// cascata. Visualmente mais "pesada" que o botão ghost de cancelar (variante
// `danger`, com contorno, em vez de `ghost-danger`) e com uma frase de aviso
// acima — cancelar e excluir não podem parecer a mesma ação.
function ExcluirPedido({ pedidoId }: { pedidoId: string }) {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const erroRef = useRef<HTMLParagraphElement>(null);
  const excluir = useExcluirPedido();

  useEffect(() => {
    if (erro) erroRef.current?.focus();
  }, [erro]);

  async function executar() {
    setErro(null);
    try {
      await excluir.mutateAsync(pedidoId);
      navigate("/pedidos", { state: { pedidoExcluido: true } });
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível excluir o pedido."));
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-border pt-4" data-print-hidden>
      <p className="text-xs text-muted">
        Excluir remove o pedido e tudo que depende dele (itens, romaneios e reservas de matéria-prima
        vinculados) de forma definitiva — diferente de cancelar, não pode ser desfeito.
      </p>
      <ConfirmInline
        triggerLabel="Excluir pedido"
        triggerVariant="danger"
        question="Excluir pedido definitivamente? Esta ação não pode ser desfeita."
        danger
        loading={excluir.isPending}
        restoreFocusOnConfirm={false}
        onConfirm={executar}
      />
      {erro && (
        <p ref={erroRef} tabIndex={-1} role="alert" className={feedbackErrorClass}>
          {erro}
        </p>
      )}
    </div>
  );
}

// Matéria-prima já reservada para este pedido no recebimento de uma
// remessa — registro manual (não um algoritmo de alocação), ver design.md
// da fase 2. Só existe quando alguém marcou explicitamente essa decisão ao
// receber a matéria-prima.
function MateriaPrimaReservada({ pedidoId }: { pedidoId: string }) {
  const { data: reservas, isPending, isError, error, refetch } = useReservasPedido(pedidoId);

  const colunas: Coluna<ReservaMateriaPrimaPedido>[] = [
    {
      header: "Tecido",
      cell: (reserva) => (
        <span>
          <span className="tabular-nums">{reserva.codigo}</span> · {reserva.nome_tecido}
          {reserva.cor && <span className="text-xs text-muted"> ({reserva.cor})</span>}
        </span>
      ),
    },
    {
      header: "Quantidade reservada",
      alignRight: true,
      cell: (reserva) => (
        <span className="tabular-nums">
          {formatarQuantidade(reserva.quantidade_reservada, reserva.unidade_medida)}
        </span>
      ),
    },
    {
      header: "Recebido em",
      cell: (reserva) => formatarData(reserva.data_recebimento),
    },
  ];

  return (
    <div className="print-section space-y-3">
      <h2 className="text-sm font-medium text-ink">Matéria-prima reservada</h2>

      {isPending ? (
        <TableSkeleton linhas={2} />
      ) : isError ? (
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar as reservas de matéria-prima.")}
          onRetry={() => void refetch()}
        />
      ) : reservas.length === 0 ? (
        <EmptyState
          titulo="Nenhuma matéria-prima reservada ainda"
          descricao="Quando uma remessa de tecido chegar, ela pode ser reservada para este pedido na tela de Compras."
        />
      ) : (
        <ResponsiveTable
          items={reservas}
          columns={colunas}
          getRowKey={(reserva) => reserva.id}
          caption="Matéria-prima reservada para este pedido"
          mobileCard={(reserva) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{reserva.codigo}</span> · {reserva.nome_tecido}
                {reserva.cor && <span className="text-muted"> ({reserva.cor})</span>}
              </p>
              <p className="text-sm text-body tabular-nums">
                {formatarQuantidade(reserva.quantidade_reservada, reserva.unidade_medida)}
              </p>
              <p className="text-xs text-muted">Recebido em {formatarData(reserva.data_recebimento)}</p>
            </div>
          )}
        />
      )}
    </div>
  );
}

export function PedidoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: pedido, isPending, isError, error, refetch } = usePedido(id);
  useDocumentTitle(pedido ? pedido.codigo : "Pedido");

  // Um pedido pode ter gerado mais de um romaneio (envio parcial, ver
  // design.md decisão 5) — buscamos o detalhe de cada um para somar, por
  // produto, quanto já saiu da oficina e derivar o que ainda falta.
  const romaneioIds = pedido?.romaneios.map((romaneio) => romaneio.id) ?? [];
  const romaneiosQueries = useRomaneiosDetalhe(romaneioIds);
  const romaneiosCarregando = romaneiosQueries.some((query) => query.isPending);
  const romaneiosCarregados = romaneiosQueries.flatMap((query) => (query.data ? [query.data] : []));
  const enviadoPorProduto = somarEnviadoPorProduto(romaneiosCarregados);

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

  // Coluna aparece quando algum item tem instrução (descrição da peça) e/ou
  // destino de serviço externo — os dois casos que DetalheItemPedido exibe.
  const temItemComDetalhe = pedido.itens.some(
    (item) => item.instrucao || item.destino_servico_externo !== "nenhum",
  );
  const temRomaneios = pedido.romaneios.length > 0;

  // Estado derivado — não um novo valor de status — comparando, por item, a
  // quantidade pedida com a já enviada na soma dos romaneios existentes
  // (design.md decisão 5, spec pedido-envio-parcial). Só é conclusivo depois
  // que o detalhe de todos os romaneios do pedido termina de carregar.
  const parcialmenteAtendido =
    !romaneiosCarregando && temRomaneios && algumItemComEnvioPendente(pedido.itens, enviadoPorProduto);

  const colunas: Coluna<PedidoItem>[] = [
    { header: "Código", cell: (item) => <span className="tabular-nums">{item.codigo}</span> },
    { header: "Produto", cell: (item) => <span className="font-medium text-ink">{item.nome}</span> },
    {
      header: "Quantidade",
      alignRight: true,
      cell: (item) => <span className="tabular-nums">{formatarQuantidade(item.quantidade, "unidade")}</span>,
    },
    ...(temRomaneios
      ? [
          {
            header: "Enviado",
            cell: (item: PedidoItem) => <SituacaoEnvioItem item={item} enviadoPorProduto={enviadoPorProduto} carregando={romaneiosCarregando} />,
          },
        ]
      : []),
    ...(temItemComDetalhe
      ? [
          {
            header: "Instrução",
            cell: (item: PedidoItem) => <DetalheItemPedido item={item} pedidoId={pedido.id} />,
          },
        ]
      : []),
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
              <span
                id={STATUS_PEDIDO_DOM_ID}
                tabIndex={-1}
                className={STATUS_PEDIDO_CLASS[pedido.status]}
              >
                {STATUS_PEDIDO_LABEL[pedido.status]}
                {parcialmenteAtendido && (
                  <span className="ml-1 text-sm font-normal text-muted">· parcial</span>
                )}
              </span>
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
          {temRomaneios && (
            <ResumoItem
              rotulo={pedido.romaneios.length === 1 ? "Romaneio" : "Romaneios"}
              valor={
                <ul className="space-y-1">
                  {pedido.romaneios.map((romaneio) => (
                    <li key={romaneio.id}>
                      <Link
                        to={`/romaneios/${romaneio.id}`}
                        className="font-medium tabular-nums text-action hover:underline"
                      >
                        {romaneio.codigo}
                      </Link>{" "}
                      <span className="text-xs text-muted">{formatarData(romaneio.data_saida)}</span>
                    </li>
                  ))}
                </ul>
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

        <ExcluirPedido pedidoId={pedido.id} />
      </div>

      <div className="print-section space-y-3">
        <h2 className="text-sm font-medium text-ink">Itens</h2>
        <ResponsiveTable
          items={pedido.itens}
          columns={colunas}
          getRowKey={(item) => item.id}
          caption="Itens do pedido"
          mobileCard={(item) => (
            <div className="space-y-1">
              <p className="font-medium text-ink">
                <span className="tabular-nums">{item.codigo}</span> · {item.nome}
              </p>
              <p className="text-sm text-body tabular-nums">
                {formatarQuantidade(item.quantidade, "unidade")}
              </p>
              {temRomaneios && (
                <p className="pt-0.5">
                  <SituacaoEnvioItem
                    item={item}
                    enviadoPorProduto={enviadoPorProduto}
                    carregando={romaneiosCarregando}
                  />
                </p>
              )}
              {(item.instrucao || item.destino_servico_externo !== "nenhum") && (
                <div className="pt-1">
                  <DetalheItemPedido item={item} pedidoId={pedido.id} />
                </div>
              )}
            </div>
          )}
        />
      </div>

      <MateriaPrimaReservada pedidoId={pedido.id} />
    </div>
  );
}
