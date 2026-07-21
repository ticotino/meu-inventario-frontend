import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useClientes } from "../../hooks/useClientes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useCreatePedido } from "../../hooks/usePedidos";
import { useProdutos } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";
import { TIPOS_BENEFICIAMENTO } from "../../types/beneficiamento";
import type { TipoBeneficiamento } from "../../types/beneficiamento";
import { formatarQuantidade } from "../../utils/format";
import { TIPO_BENEFICIAMENTO_LABEL } from "../beneficiamento/tipoBeneficiamento";
import { novoPedidoSchema } from "./novoPedidoSchema";
import type { NovoPedidoForm } from "./novoPedidoSchema";

function hoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function NovoPedido() {
  useDocumentTitle("Novo pedido");
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  // Anúncio para leitores de tela ao adicionar/remover linhas de produto;
  // o número do item muda a cada ação, então mensagens repetidas são anunciadas.
  const [anuncioItens, setAnuncioItens] = useState("");
  const { data: clientes, isPending: carregandoClientes } = useClientes();
  const { data: produtos, isPending: carregandoProdutos } = useProdutos({ ativo: true });
  const criar = useCreatePedido();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NovoPedidoForm>({
    resolver: zodResolver(novoPedidoSchema),
    defaultValues: {
      cliente_id: "",
      data_pedido: hoje(),
      data_prevista_entrega: hoje(),
      observacoes: "",
      itens: [
        {
          produto_id: "",
          quantidade: "",
          precisa_beneficiamento: false,
          destino_beneficiamento: "",
          instrucao: "",
          imagem_referencia_url: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itensSelecionados = useWatch({ control, name: "itens" });

  const semClientes = !carregandoClientes && (clientes?.length ?? 0) === 0;
  const semProdutos = !carregandoProdutos && (produtos?.length ?? 0) === 0;
  const produtoPorId = new Map(produtos?.map((p) => [p.id, p]) ?? []);

  async function onSubmit(dados: NovoPedidoForm) {
    setErro(null);

    // Validações que dependem dos dados carregados (duplicata e saldo);
    // o backend continua sendo a fonte da verdade.
    let temErroItem = false;
    const vistos = new Set<string>();
    dados.itens.forEach((item, i) => {
      if (vistos.has(item.produto_id)) {
        setError(`itens.${i}.produto_id`, { message: "Produto repetido" });
        temErroItem = true;
      }
      vistos.add(item.produto_id);

      const produto = produtoPorId.get(item.produto_id);
      if (produto && Number(item.quantidade) > Number(produto.quantidade_disponivel)) {
        setError(`itens.${i}.quantidade`, {
          message: `Saldo insuficiente — disponível ${formatarQuantidade(produto.quantidade_disponivel, "unidade")}`,
        });
        temErroItem = true;
      }
    });
    if (temErroItem) return;

    try {
      const criado = await criar.mutateAsync({
        cliente_id: dados.cliente_id,
        data_pedido: dados.data_pedido,
        data_prevista_entrega: dados.data_prevista_entrega,
        observacoes: dados.observacoes || undefined,
        itens: dados.itens.map((item) => ({
          produto_id: item.produto_id,
          quantidade: Number(item.quantidade),
          // O toggle "precisa de acabamento externo?" governa os três campos
          // juntos: desmarcado, o item é salvo com destino "nenhum" e sem
          // instrução/imagem, mesmo que o usuário tenha digitado algo antes.
          destino_beneficiamento: item.precisa_beneficiamento
            ? (item.destino_beneficiamento as TipoBeneficiamento)
            : "nenhum",
          instrucao: item.precisa_beneficiamento && item.instrucao ? item.instrucao : undefined,
          imagem_referencia_url:
            item.precisa_beneficiamento && item.imagem_referencia_url ? item.imagem_referencia_url : undefined,
        })),
      });
      navigate(`/pedidos/${criado.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível registrar o pedido."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Novo pedido"
        descricao="A quantidade encomendada consome o estoque dos produtos no momento do registro."
        action={
          <Link to="/pedidos" className="text-sm font-medium text-action hover:underline">
            Voltar ao registro
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Select
            id="pedido-cliente"
            label="Cliente"
            required
            disabled={semClientes}
            error={errors.cliente_id?.message}
            hint={
              semClientes ? (
                <>
                  Nenhum cliente cadastrado.{" "}
                  <Link to="/pedidos/clientes" className="font-medium text-action hover:underline">
                    Cadastre um cliente
                  </Link>{" "}
                  antes de registrar o pedido.
                </>
              ) : undefined
            }
            {...register("cliente_id")}
          >
            <option value="" disabled>
              {carregandoClientes ? "Carregando..." : "Selecione..."}
            </option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="pedido-data"
              label="Data do pedido"
              type="date"
              required
              error={errors.data_pedido?.message}
              {...register("data_pedido")}
            />
            <Input
              id="pedido-data-entrega"
              label="Prazo de entrega"
              type="date"
              required
              error={errors.data_prevista_entrega?.message}
              hint="Data combinada para concluir a entrega."
              {...register("data_prevista_entrega")}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-body">Produtos encomendados</legend>
            {semProdutos && (
              <p className="text-xs text-muted">
                Nenhum produto ativo em estoque.{" "}
                <Link to="/producao/produtos/novo" className="font-medium text-action hover:underline">
                  Cadastre um produto
                </Link>{" "}
                antes de registrar o pedido.
              </p>
            )}
            {fields.map((field, i) => {
              const produtoSelecionado = produtoPorId.get(itensSelecionados?.[i]?.produto_id ?? "");
              const precisaBeneficiamento = itensSelecionados?.[i]?.precisa_beneficiamento ?? false;
              return (
                <div key={field.id} className="space-y-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-start">
                    <Select
                      id={`pedido-item-produto-${i}`}
                      label={`Produto ${i + 1}`}
                      required
                      disabled={semProdutos}
                      error={errors.itens?.[i]?.produto_id?.message}
                      {...register(`itens.${i}.produto_id`)}
                    >
                      <option value="" disabled>
                        {carregandoProdutos ? "Carregando..." : "Selecione..."}
                      </option>
                      {produtos?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} · {p.nome}
                        </option>
                      ))}
                    </Select>
                    <div className="sm:w-44">
                      <Input
                        id={`pedido-item-qtd-${i}`}
                        label="Quantidade"
                        type="number"
                        step="0.001"
                        min="0"
                        inputMode="decimal"
                        required
                        aria-label={`Quantidade do produto ${i + 1}`}
                        hint={
                          produtoSelecionado
                            ? `Disponível: ${formatarQuantidade(produtoSelecionado.quantidade_disponivel, "unidade")}`
                            : undefined
                        }
                        error={errors.itens?.[i]?.quantidade?.message}
                        {...register(`itens.${i}.quantidade`)}
                      />
                    </div>
                    <div className="sm:pt-6">
                      <Button
                        variant="ghost-danger"
                        onClick={() => {
                          remove(i);
                          setAnuncioItens(`Produto ${i + 1} removido`);
                        }}
                        disabled={fields.length === 1}
                        aria-label={`Remover produto ${i + 1}`}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>

                  <label
                    htmlFor={`pedido-item-beneficiamento-${i}`}
                    className="flex items-center gap-2 text-sm text-body"
                  >
                    <input
                      id={`pedido-item-beneficiamento-${i}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-control-border text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                      {...register(`itens.${i}.precisa_beneficiamento`)}
                    />
                    Este item precisa de acabamento externo?
                  </label>

                  {precisaBeneficiamento && (
                    <div className="space-y-3 rounded-md border border-border p-3">
                      <div className="sm:w-64">
                        <Select
                          id={`pedido-item-destino-${i}`}
                          label="Destino do acabamento"
                          required
                          error={errors.itens?.[i]?.destino_beneficiamento?.message}
                          {...register(`itens.${i}.destino_beneficiamento`)}
                        >
                          <option value="" disabled>
                            Selecione...
                          </option>
                          {TIPOS_BENEFICIAMENTO.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {TIPO_BENEFICIAMENTO_LABEL[tipo]}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <Textarea
                        id={`pedido-item-instrucao-${i}`}
                        label="Instrução"
                        maxLength={500}
                        hint="Opcional. Cores, tamanho, posição, texto ou desenho combinado com o cliente."
                        error={errors.itens?.[i]?.instrucao?.message}
                        {...register(`itens.${i}.instrucao`)}
                      />
                      <Input
                        id={`pedido-item-imagem-${i}`}
                        label="Imagem de referência (URL)"
                        type="url"
                        maxLength={2048}
                        hint="Opcional. Link para a imagem (logo do cliente, desenho do bordado)."
                        error={errors.itens?.[i]?.imagem_referencia_url?.message}
                        {...register(`itens.${i}.imagem_referencia_url`)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {errors.itens?.root?.message && (
              <p role="alert" className="text-xs text-danger">
                {errors.itens.root.message}
              </p>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                append({
                  produto_id: "",
                  quantidade: "",
                  precisa_beneficiamento: false,
                  destino_beneficiamento: "",
                  instrucao: "",
                  imagem_referencia_url: "",
                });
                setAnuncioItens(`Produto ${fields.length + 1} adicionado`);
              }}
              disabled={semProdutos}
            >
              + Adicionar produto
            </Button>
            <p aria-live="polite" className="sr-only">
              {anuncioItens}
            </p>
          </fieldset>

          <Textarea
            id="pedido-observacoes"
            label="Observações"
            maxLength={1000}
            hint="Opcional."
            error={errors.observacoes?.message}
            {...register("observacoes")}
          />

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} loadingText="Registrando..." disabled={semClientes || semProdutos}>
            Registrar pedido
          </Button>
        </form>
      </div>
    </div>
  );
}
