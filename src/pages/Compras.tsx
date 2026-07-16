import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { ConfirmInline } from "../components/ui/ConfirmInline";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { FormErrorBanner } from "../components/ui/FormErrorBanner";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { SuccessBanner } from "../components/ui/SuccessBanner";
import { TableSkeleton } from "../components/ui/TableSkeleton";
import { Textarea } from "../components/ui/Textarea";
import {
  useCancelarSolicitacaoCompra,
  useCompras,
  useCriarSolicitacaoCompra,
  useReceberSolicitacaoCompra,
} from "../hooks/useCompras";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../services/api";
import type { NecessidadeCompra } from "../types/compra";
import { formatarDataHora, formatarQuantidade } from "../utils/format";

interface CompraItemProps {
  item: NecessidadeCompra;
  onFeedback: (mensagem: string) => void;
}

function numeroPositivo(valor: string): number | null {
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function CompraItem({ item, onFeedback }: CompraItemProps) {
  const sugestao = Number(item.quantidade_sugerida) > 0 ? item.quantidade_sugerida : "";
  const [quantidade, setQuantidade] = useState(item.quantidade_solicitada ?? sugestao);
  const [observacoes, setObservacoes] = useState("");
  const [erroQuantidade, setErroQuantidade] = useState<string | null>(null);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const criar = useCriarSolicitacaoCompra();
  const receber = useReceberSolicitacaoCompra();
  const cancelar = useCancelarSolicitacaoCompra();
  const temSolicitacao = item.solicitacao_id !== null;
  const processando = criar.isPending || receber.isPending || cancelar.isPending;

  async function solicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = numeroPositivo(quantidade);
    if (valor === null) {
      setErroQuantidade("Informe uma quantidade maior que zero.");
      quantidadeRef.current?.focus();
      return;
    }
    setErroQuantidade(null);
    setErroApi(null);
    try {
      await criar.mutateAsync({
        materia_prima_id: item.materia_prima_id,
        quantidade_solicitada: valor,
        observacoes: observacoes.trim() || undefined,
      });
      onFeedback(`Solicitação de ${item.codigo} criada.`);
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível criar a solicitação."));
    }
  }

  async function confirmarRecebimento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valor = numeroPositivo(quantidade);
    if (valor === null || !item.solicitacao_id) {
      setErroQuantidade("Informe a quantidade efetivamente recebida.");
      quantidadeRef.current?.focus();
      return;
    }
    setErroQuantidade(null);
    setErroApi(null);
    try {
      await receber.mutateAsync({ id: item.solicitacao_id, quantidade_recebida: valor });
      onFeedback(`Recebimento de ${item.codigo} registrado no estoque.`);
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível registrar o recebimento."));
    }
  }

  async function cancelarSolicitacao() {
    if (!item.solicitacao_id) return;
    setErroApi(null);
    try {
      await cancelar.mutateAsync(item.solicitacao_id);
      onFeedback(`Solicitação de ${item.codigo} cancelada.`);
    } catch (error) {
      setErroApi(getApiErrorMessage(error, "Não foi possível cancelar a solicitação."));
    }
  }

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-card" aria-labelledby={`compra-${item.materia_prima_id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 id={`compra-${item.materia_prima_id}`} className="font-semibold text-ink">
            <span className="tabular-nums">{item.codigo}</span> · {item.nome_tecido}
          </h3>
          {item.cor && <p className="mt-0.5 text-sm text-muted">Cor: {item.cor}</p>}
        </div>
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${temSolicitacao ? "bg-warning-bg text-warning" : "bg-danger-bg text-danger-strong"}`}>
          {temSolicitacao ? "Compra solicitada" : "Reposição necessária"}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-muted">Saldo atual</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{formatarQuantidade(item.quantidade_disponivel, item.unidade_medida)}</dd></div>
        <div><dt className="text-muted">Estoque mínimo</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{formatarQuantidade(item.estoque_minimo, item.unidade_medida)}</dd></div>
        <div><dt className="text-muted">Reposição até o mínimo</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{formatarQuantidade(item.quantidade_sugerida, item.unidade_medida)}</dd></div>
      </dl>

      {temSolicitacao && (
        <div className="mt-4 rounded-md bg-page p-3 text-sm text-body">
          <p><span className="font-medium">Solicitado:</span> <span className="tabular-nums">{formatarQuantidade(item.quantidade_solicitada ?? "0", item.unidade_medida)}</span></p>
          {item.solicitacao_criado_em && <p className="mt-1 text-muted">Criada em {formatarDataHora(item.solicitacao_criado_em)}{item.solicitacao_criado_por_nome ? ` por ${item.solicitacao_criado_por_nome}` : ""}</p>}
          {item.solicitacao_observacoes && <p className="mt-1 whitespace-pre-wrap text-muted">{item.solicitacao_observacoes}</p>}
        </div>
      )}

      <form onSubmit={temSolicitacao ? confirmarRecebimento : solicitar} className="mt-4 space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-end">
          <Input
            id={`quantidade-compra-${item.materia_prima_id}`}
            ref={quantidadeRef}
            label={temSolicitacao ? "Quantidade recebida" : "Quantidade a solicitar"}
            type="number"
            min="0.001"
            step="0.001"
            required
            value={quantidade}
            onChange={(event) => setQuantidade(event.target.value)}
            hint={temSolicitacao ? "Informe a quantidade que chegou; ela pode ser diferente da solicitada." : `Unidade: ${item.unidade_medida}.`}
            error={erroQuantidade ?? undefined}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={temSolicitacao ? receber.isPending : criar.isPending} loadingText="Salvando…">
              {temSolicitacao ? "Confirmar recebimento" : "Criar solicitação"}
            </Button>
            {temSolicitacao && (
              <ConfirmInline
                triggerLabel="Cancelar solicitação"
                triggerVariant="danger"
                question="Cancelar a solicitação de compra?"
                danger
                loading={cancelar.isPending}
                loadingText="Cancelando…"
                onConfirm={cancelarSolicitacao}
              />
            )}
          </div>
        </div>
        {!temSolicitacao && (
          <Textarea
            id={`observacoes-compra-${item.materia_prima_id}`}
            label="Observações (opcional)"
            rows={2}
            maxLength={2000}
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
          />
        )}
        <FormErrorBanner message={erroApi} />
        {processando && <span className="sr-only" aria-live="polite">Processando solicitação de {item.codigo}</span>}
      </form>
    </article>
  );
}

export function Compras() {
  useDocumentTitle("Compras");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { data = [], isPending, isError, error, refetch } = useCompras();
  const grupos = useMemo(() => {
    const agrupados = new Map<string, { nome: string; itens: NecessidadeCompra[] }>();
    for (const item of data) {
      const grupo = agrupados.get(item.fabricante_id) ?? { nome: item.fabricante_nome, itens: [] };
      grupo.itens.push(item);
      agrupados.set(item.fabricante_id, grupo);
    }
    return [...agrupados.entries()];
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader titulo="Compras" descricao="Reponha matérias-primas ativas que atingiram o estoque mínimo." />
      {feedback && <SuccessBanner>{feedback}</SuccessBanner>}
      {isPending ? (
        <TableSkeleton linhas={5} />
      ) : isError ? (
        <ErrorState mensagem={getApiErrorMessage(error, "Não foi possível carregar a lista de compras.")} onRetry={() => void refetch()} />
      ) : grupos.length === 0 ? (
        <EmptyState titulo="Nenhuma reposição necessária" descricao="As matérias-primas ativas estão acima dos limites mínimos configurados." />
      ) : (
        <div className="space-y-8">
          {grupos.map(([fabricanteId, grupo]) => (
            <section key={fabricanteId} aria-labelledby={`fabricante-compra-${fabricanteId}`} className="space-y-3">
              <div>
                <h2 id={`fabricante-compra-${fabricanteId}`} className="text-lg font-semibold text-ink">{grupo.nome}</h2>
                <p className="mt-1 text-sm text-muted">{grupo.itens.length} {grupo.itens.length === 1 ? "item para acompanhar" : "itens para acompanhar"}</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {grupo.itens.map((item) => <CompraItem key={item.materia_prima_id} item={item} onFeedback={setFeedback} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
