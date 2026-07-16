import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePedido, usePedidos } from "../../hooks/usePedidos";
import { useCreateRomaneio, useSugestoesCaixa } from "../../hooks/useRomaneios";
import { getApiErrorMessage } from "../../services/api";
import type { PedidoItem } from "../../types/pedido";
import { formatarQuantidade } from "../../utils/format";

const caixaSchema = z.object({
  quantidade_por_caixa: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((valor) => Number(valor) > 0, "Deve ser maior que zero")
    // Espelha o decimal(12,3) do banco: mais casas seriam arredondadas ao gravar.
    .refine((valor) => Math.round(Number(valor) * 1000) / 1000 === Number(valor), "Use no máximo 3 casas decimais"),
  quantidade_caixas: z
    .string()
    .min(1, "Informe as caixas")
    .refine((valor) => Number.isInteger(Number(valor)) && Number(valor) > 0, "Use um número inteiro de caixas")
    .refine((valor) => Number(valor) <= 10000, "Máximo de 10.000 caixas por linha"),
});

const novoRomaneioSchema = z.object({
  data_saida: z.string().min(1, "Informe a data de saída"),
  itens: z.array(
    z.object({
      produto_id: z.string(),
      caixas: z.array(caixaSchema).min(1, "Informe ao menos uma caixa"),
    }),
  ),
});

type NovoRomaneioForm = z.infer<typeof novoRomaneioSchema>;

function hoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function somaCaixas(caixas: Array<{ quantidade_por_caixa: string; quantidade_caixas: string }> | undefined): number {
  if (!caixas) return 0;
  return caixas.reduce((total, caixa) => {
    const qtd = Number(caixa.quantidade_por_caixa);
    const n = Number(caixa.quantidade_caixas);
    if (!Number.isFinite(qtd) || !Number.isFinite(n)) return total;
    return total + qtd * n;
  }, 0);
}

// Predicado único de "fecha com o pedido" — o mesmo do backend (comparação de
// cada lado arredondado a 3 casas). Usado pelo contador ao vivo E pelo submit,
// para o indicador nunca discordar da validação.
function fechaComPedido(empacotado: number, pedidoQtd: number): boolean {
  return empacotado.toFixed(3) === pedidoQtd.toFixed(3);
}

interface ItemCaixasProps {
  indice: number;
  itemPedido: PedidoItem;
  sugestao: string | undefined;
  control: Control<NovoRomaneioForm>;
  register: UseFormRegister<NovoRomaneioForm>;
  errors: FieldErrors<NovoRomaneioForm>;
}

function ItemCaixas({ indice, itemPedido, sugestao, control, register, errors }: ItemCaixasProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `itens.${indice}.caixas` });
  const caixas = useWatch({ control, name: `itens.${indice}.caixas` });
  // Anúncio para leitores de tela ao adicionar/remover linhas de caixas;
  // o número da linha muda a cada ação, então mensagens repetidas são anunciadas.
  const [anuncioLinhas, setAnuncioLinhas] = useState("");

  const pedidoQtd = Number(itemPedido.quantidade);
  const empacotado = somaCaixas(caixas);
  const diferenca = pedidoQtd - empacotado;
  const fecha = fechaComPedido(empacotado, pedidoQtd);

  return (
    <fieldset className="space-y-3 rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-medium text-body">
        <span className="tabular-nums">{itemPedido.codigo}</span> · {itemPedido.nome}
      </legend>

      <p className="text-xs tabular-nums" aria-live="polite">
        {fecha ? (
          <span className="font-medium text-ink">
            Empacotado {formatarQuantidade(empacotado, "unidade")} — fecha com o pedido.
          </span>
        ) : (
          <span className="text-muted">
            Empacotado {formatarQuantidade(empacotado, "unidade")} de{" "}
            {formatarQuantidade(itemPedido.quantidade, "unidade")} —{" "}
            <span className={diferenca < 0 ? "font-medium text-danger" : "font-medium text-ink"}>
              {diferenca < 0
                ? `${formatarQuantidade(Math.abs(diferenca), "unidade")} a mais`
                : `faltam ${formatarQuantidade(diferenca, "unidade")}`}
            </span>
          </span>
        )}
      </p>

      {fields.map((field, i) => (
        <div key={field.id} className="grid gap-4 sm:grid-cols-[auto_auto_auto] sm:items-start">
          <div className="sm:w-40">
            <Input
              id={`item-${indice}-caixa-${i}-qtd`}
              label="Und por caixa"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              required
              hint={i === 0 && sugestao ? `Da última vez: ${formatarQuantidade(sugestao, "unidade")}/caixa` : undefined}
              error={errors.itens?.[indice]?.caixas?.[i]?.quantidade_por_caixa?.message}
              {...register(`itens.${indice}.caixas.${i}.quantidade_por_caixa`)}
            />
          </div>
          <div className="sm:w-32">
            <Input
              id={`item-${indice}-caixa-${i}-n`}
              label="Caixas"
              type="number"
              step="1"
              min="1"
              inputMode="numeric"
              required
              error={errors.itens?.[indice]?.caixas?.[i]?.quantidade_caixas?.message}
              {...register(`itens.${indice}.caixas.${i}.quantidade_caixas`)}
            />
          </div>
          <div className="sm:pt-6">
            <Button
              variant="ghost-danger"
              onClick={() => {
                remove(i);
                setAnuncioLinhas(`Linha de caixas ${i + 1} removida`);
              }}
              disabled={fields.length === 1}
              aria-label={`Remover linha de caixas ${i + 1} de ${itemPedido.nome}`}
            >
              Remover
            </Button>
          </div>
        </div>
      ))}

      {errors.itens?.[indice]?.caixas?.message && (
        <p role="alert" className="text-xs text-danger">
          {errors.itens[indice]?.caixas?.message}
        </p>
      )}

      <Button
        variant="ghost"
        onClick={() => {
          append({ quantidade_por_caixa: "", quantidade_caixas: "" });
          setAnuncioLinhas(`Linha de caixas ${fields.length + 1} adicionada`);
        }}
      >
        + Adicionar linha de caixas
      </Button>
      <p aria-live="polite" className="sr-only">
        {anuncioLinhas}
      </p>
    </fieldset>
  );
}

export function NovoRomaneio() {
  useDocumentTitle("Gerar romaneio");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState(searchParams.get("pedido") ?? "");

  const {
    data: pedidosPendentes,
    isPending: carregandoPedidos,
    isError: erroListaPedidos,
  } = usePedidos({ status: "pendente" });
  const {
    data: pedidoCarregado,
    isPending: carregandoPedido,
    isError: erroPedido,
  } = usePedido(pedidoId || undefined);
  const criar = useCreateRomaneio();

  // Um link antigo (?pedido=ID) pode apontar para um pedido que já saiu de
  // "pendente" — nesse caso o form não deve montar caixas que o backend rejeitaria.
  const pedido = pedidoCarregado?.status === "pendente" ? pedidoCarregado : undefined;
  const pedidoNaoPendente = pedidoCarregado !== undefined && pedidoCarregado.status !== "pendente";

  const produtoIds = useMemo(() => pedido?.itens.map((item) => item.produto_id) ?? [], [pedido]);
  const sugestoesQuery = useSugestoesCaixa(produtoIds);
  // Um único mapa (valor já normalizado) alimenta o prefill do reset e o hint
  // "Da última vez" — duas derivações separadas poderiam divergir.
  const sugestaoPorProduto = useMemo(
    () => new Map(sugestoesQuery.data?.map((s) => [s.produto_id, String(Number(s.quantidade_por_caixa))]) ?? []),
    [sugestoesQuery.data],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NovoRomaneioForm>({
    resolver: zodResolver(novoRomaneioSchema),
    defaultValues: { data_saida: hoje(), itens: [] },
  });

  // Monta as linhas do form UMA vez por pedido selecionado (uma linha de caixas
  // por produto, pré-preenchida com o histórico), esperando as sugestões
  // resolverem antes. O ref impede que refetches em background (refoco da
  // janela, invalidação de cache) chamem reset() e apaguem o que o usuário
  // já digitou.
  const pedidoMontadoRef = useRef<string | null>(null);
  const [pedidoMontado, setPedidoMontado] = useState<string | null>(null);
  const sugestoesProntas = produtoIds.length > 0 && !sugestoesQuery.isPending;

  useEffect(() => {
    if (!pedido || !sugestoesProntas) return;
    if (pedidoMontadoRef.current === pedido.id) return;
    pedidoMontadoRef.current = pedido.id;

    reset({
      data_saida: hoje(),
      itens: pedido.itens.map((item) => ({
        produto_id: item.produto_id,
        caixas: [
          {
            quantidade_por_caixa: sugestaoPorProduto.get(item.produto_id) ?? "",
            quantidade_caixas: "",
          },
        ],
      })),
    });
    setPedidoMontado(pedido.id);
  }, [pedido, sugestoesProntas, sugestaoPorProduto, reset]);

  const semPedidosPendentes = !carregandoPedidos && (pedidosPendentes?.length ?? 0) === 0;

  async function onSubmit(dados: NovoRomaneioForm) {
    setErro(null);
    if (!pedido) return;

    // Checagem client-side da soma exata; o backend é a fonte da verdade.
    // Pareia por produto_id (não por índice) para o erro nunca cair no
    // fieldset errado se a ordem dos itens do pedido mudar num refetch.
    let temErro = false;
    for (const itemPedido of pedido.itens) {
      const indiceForm = dados.itens.findIndex((item) => item.produto_id === itemPedido.produto_id);
      if (indiceForm === -1) continue; // backend acusará o item faltante
      const empacotado = somaCaixas(dados.itens[indiceForm].caixas);
      const esperado = Number(itemPedido.quantidade);
      if (!fechaComPedido(empacotado, esperado)) {
        setError(`itens.${indiceForm}.caixas`, {
          type: "validate",
          message: `A soma das caixas (${empacotado.toFixed(3)}) precisa ser igual à quantidade do pedido (${esperado.toFixed(3)}).`,
        });
        temErro = true;
      }
    }
    if (temErro) return;

    try {
      const criado = await criar.mutateAsync({
        pedido_id: pedido.id,
        data_saida: dados.data_saida,
        itens: dados.itens.map((item) => ({
          produto_id: item.produto_id,
          caixas: item.caixas.map((caixa) => ({
            quantidade_por_caixa: Number(caixa.quantidade_por_caixa),
            quantidade_caixas: Number(caixa.quantidade_caixas),
          })),
        })),
      });
      navigate(`/romaneios/${criado.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível gerar o romaneio."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Gerar romaneio"
        descricao="Monte as caixas de um pedido pendente — ao salvar, o pedido é marcado como atendido."
        action={
          <Link to="/romaneios" className="text-sm font-medium text-action hover:underline">
            Voltar aos romaneios
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Select
            id="romaneio-pedido"
            label="Pedido"
            required
            value={pedidoId}
            onChange={(e) => setPedidoId(e.target.value)}
            disabled={semPedidosPendentes}
            hint={
              semPedidosPendentes ? (
                <>
                  Nenhum pedido pendente.{" "}
                  <Link to="/pedidos/novo" className="font-medium text-action hover:underline">
                    Registre um pedido
                  </Link>{" "}
                  antes de gerar o romaneio.
                </>
              ) : undefined
            }
          >
            <option value="" disabled>
              {carregandoPedidos ? "Carregando..." : "Selecione..."}
            </option>
            {pedidosPendentes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} · {p.cliente_nome}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="romaneio-data"
              label="Data de saída"
              type="date"
              required
              error={errors.data_saida?.message}
              {...register("data_saida")}
            />
          </div>

          {erroListaPedidos && (
            <p role="alert" className={feedbackErrorClass}>
              Não foi possível carregar os pedidos pendentes — recarregue a página e tente novamente.
            </p>
          )}
          {pedidoId && (carregandoPedido || (pedido && pedidoMontado !== pedido.id)) && (
            <p role="status" className="text-sm text-muted">Carregando itens do pedido...</p>
          )}
          {pedidoId && erroPedido && (
            <p role="alert" className={feedbackErrorClass}>
              Não foi possível carregar o pedido — selecione outro ou tente novamente.
            </p>
          )}
          {pedidoNaoPendente && (
            <p role="alert" className={feedbackErrorClass}>
              O pedido {pedidoCarregado?.codigo} não está mais pendente — selecione um pedido pendente.
            </p>
          )}

          {pedido &&
            pedidoMontado === pedido.id &&
            pedido.itens.map((itemPedido, i) => (
              <ItemCaixas
                key={itemPedido.produto_id}
                indice={i}
                itemPedido={itemPedido}
                sugestao={sugestaoPorProduto.get(itemPedido.produto_id)}
                control={control}
                register={register}
                errors={errors}
              />
            ))}

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Gerando..."
            disabled={!pedido || pedidoMontado !== pedido.id || semPedidosPendentes}
          >
            Gerar romaneio
          </Button>
        </form>
      </div>
    </div>
  );
}
