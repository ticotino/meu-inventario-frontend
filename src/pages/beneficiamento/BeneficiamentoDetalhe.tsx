import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useBeneficiamento, useCancelarBeneficiamento, useReceberBeneficiamento } from "../../hooks/useBeneficiamentos";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import { formatarData, formatarDataHora, formatarMoeda, formatarQuantidade } from "../../utils/format";
import { diferencaRecebimento, excedeQuantidadeEnviada } from "./beneficiamentoValidacao";
import { STATUS_BENEFICIAMENTO_CLASS, STATUS_BENEFICIAMENTO_LABEL } from "./statusBeneficiamento";
import { TIPO_BENEFICIAMENTO_LABEL } from "./tipoBeneficiamento";

function ResumoItem({ rotulo, valor, destaque = false }: { rotulo: string; valor: React.ReactNode; destaque?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className={destaque ? "mt-0.5 text-2xl font-semibold tabular-nums text-ink" : "mt-0.5 text-sm text-body"}>
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
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="animate-pulse space-y-3 motion-reduce:animate-none">
          <div className="h-4 w-1/4 rounded bg-border" />
          <div className="h-9 rounded bg-border/60" />
          <div className="h-9 rounded bg-border/60" />
        </div>
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

function ReceberForm({
  beneficiamentoId,
  quantidadeEnviada,
  onCancelar,
}: {
  beneficiamentoId: string;
  quantidadeEnviada: string;
  onCancelar: () => void;
}) {
  const [quantidadeRecebida, setQuantidadeRecebida] = useState("");
  const [valorCobrado, setValorCobrado] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const receber = useReceberBeneficiamento();

  const enviada = Number(quantidadeEnviada);
  const recebidaNumero = Number(quantidadeRecebida);
  const excede = quantidadeRecebida !== "" && excedeQuantidadeEnviada(recebidaNumero, enviada);
  const perda =
    quantidadeRecebida !== "" && !excede && recebidaNumero > 0 ? diferencaRecebimento(enviada, recebidaNumero) : 0;

  async function salvar() {
    setErro(null);
    if (!quantidadeRecebida || recebidaNumero <= 0) {
      setErro("Informe a quantidade recebida.");
      return;
    }
    if (excedeQuantidadeEnviada(recebidaNumero, enviada)) {
      setErro(`Não é possível receber mais do que foi enviado (${formatarQuantidade(enviada, "unidade")}).`);
      return;
    }
    try {
      await receber.mutateAsync({
        id: beneficiamentoId,
        input: {
          quantidade_recebida: recebidaNumero,
          valor_cobrado: valorCobrado ? Number(valorCobrado) : undefined,
          nota_fiscal: notaFiscal || undefined,
        },
      });
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível marcar como recebido."));
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4" data-print-hidden>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          id="beneficiamento-quantidade-recebida"
          label="Quantidade recebida"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          error={excede ? `Excede a quantidade enviada (${formatarQuantidade(enviada, "unidade")})` : undefined}
          value={quantidadeRecebida}
          onChange={(event) => setQuantidadeRecebida(event.target.value)}
        />
        <Input
          id="beneficiamento-valor-cobrado-receber"
          label="Valor cobrado"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          hint="Opcional."
          value={valorCobrado}
          onChange={(event) => setValorCobrado(event.target.value)}
        />
        <Input
          id="beneficiamento-nota-fiscal-receber"
          label="Nota fiscal"
          type="text"
          maxLength={60}
          hint="Opcional."
          value={notaFiscal}
          onChange={(event) => setNotaFiscal(event.target.value)}
        />
      </div>

      {perda > 0 && (
        <p className="text-xs text-muted">
          {formatarQuantidade(perda, "unidade")} a menos que o enviado (perda no processo).
        </p>
      )}

      {erro && (
        <p role="alert" className={feedbackErrorClass}>
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void salvar()} loading={receber.isPending} loadingText="Salvando...">
          Confirmar recebimento
        </Button>
        <Button variant="secondary" onClick={onCancelar} disabled={receber.isPending}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function AcoesStatusBeneficiamento({
  beneficiamentoId,
  status,
  quantidadeEnviada,
}: {
  beneficiamentoId: string;
  status: string;
  quantidadeEnviada: string;
}) {
  const [recebendo, setRecebendo] = useState(false);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const cancelar = useCancelarBeneficiamento();

  async function executarCancelar() {
    setErro(null);
    try {
      await cancelar.mutateAsync(beneficiamentoId);
      setConfirmandoCancelar(false);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível cancelar o envio."));
    }
  }

  if (status !== "enviado") return null;

  if (recebendo) {
    return (
      <ReceberForm
        beneficiamentoId={beneficiamentoId}
        quantidadeEnviada={quantidadeEnviada}
        onCancelar={() => setRecebendo(false)}
      />
    );
  }

  return (
    <div className="space-y-2" data-print-hidden>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setRecebendo(true)}>Marcar como recebido</Button>
        {confirmandoCancelar ? (
          <span className="inline-flex items-center gap-1 text-sm text-body">
            Cancelar envio?
            <Button
              variant="danger"
              className="min-h-9 px-2 py-1"
              onClick={() => void executarCancelar()}
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
          <Button variant="ghost-danger" onClick={() => setConfirmandoCancelar(true)}>
            Cancelar envio
          </Button>
        )}
      </div>
      {erro && (
        <p role="alert" className={feedbackErrorClass}>
          {erro}
        </p>
      )}
    </div>
  );
}

export function BeneficiamentoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: beneficiamento, isPending, isError, error, refetch } = useBeneficiamento(id);
  useDocumentTitle(beneficiamento ? beneficiamento.codigo : "Beneficiamento");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar o beneficiamento.")}
          onRetry={() => void refetch()}
        />
        <Link to="/beneficiamento" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar ao registro de beneficiamento
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={beneficiamento.codigo}
        descricao={`${TIPO_BENEFICIAMENTO_LABEL[beneficiamento.tipo]} com ${beneficiamento.prestador_nome}`}
        action={
          <Link to="/beneficiamento" className="text-sm font-medium text-action hover:underline">
            Voltar ao registro
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Resumo</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResumoItem
            rotulo="Status"
            valor={
              <span className={STATUS_BENEFICIAMENTO_CLASS[beneficiamento.status]}>
                {STATUS_BENEFICIAMENTO_LABEL[beneficiamento.status]}
              </span>
            }
            destaque
          />
          <ResumoItem
            rotulo="Produção"
            valor={
              <Link to={`/producao/${beneficiamento.producao_id}`} className="font-medium text-action hover:underline">
                {beneficiamento.producao_codigo} · {beneficiamento.produto_nome}
              </Link>
            }
          />
          <ResumoItem rotulo="Prestador" valor={beneficiamento.prestador_nome} />
          <ResumoItem rotulo="Tipo" valor={TIPO_BENEFICIAMENTO_LABEL[beneficiamento.tipo]} />
          <ResumoItem rotulo="Quantidade enviada" valor={formatarQuantidade(beneficiamento.quantidade_enviada, "unidade")} />
          {beneficiamento.quantidade_recebida !== null && (
            <ResumoItem
              rotulo="Quantidade recebida"
              valor={formatarQuantidade(beneficiamento.quantidade_recebida, "unidade")}
            />
          )}
          <ResumoItem rotulo="Data de envio" valor={formatarData(beneficiamento.data_envio)} />
          {beneficiamento.data_recebimento_prevista && (
            <ResumoItem rotulo="Recebimento previsto" valor={formatarData(beneficiamento.data_recebimento_prevista)} />
          )}
          {beneficiamento.data_recebimento && (
            <ResumoItem rotulo="Data de recebimento" valor={formatarData(beneficiamento.data_recebimento)} />
          )}
          {beneficiamento.valor_cobrado !== null && (
            <ResumoItem rotulo="Valor cobrado" valor={formatarMoeda(beneficiamento.valor_cobrado)} />
          )}
          {beneficiamento.nota_fiscal && <ResumoItem rotulo="Nota fiscal" valor={beneficiamento.nota_fiscal} />}
          <ResumoItem rotulo="Registrado por" valor={beneficiamento.usuario_nome} />
          {beneficiamento.recebido_em && (
            <ResumoItem rotulo="Recebido em" valor={formatarDataHora(beneficiamento.recebido_em)} />
          )}
          {beneficiamento.cancelado_em && (
            <ResumoItem rotulo="Cancelado em" valor={formatarDataHora(beneficiamento.cancelado_em)} />
          )}
        </dl>
        {beneficiamento.observacoes && <p className="mt-4 text-sm text-body">{beneficiamento.observacoes}</p>}

        <div className="mt-4">
          <AcoesStatusBeneficiamento
            beneficiamentoId={beneficiamento.id}
            status={beneficiamento.status}
            quantidadeEnviada={beneficiamento.quantidade_enviada}
          />
        </div>
      </div>
    </div>
  );
}
