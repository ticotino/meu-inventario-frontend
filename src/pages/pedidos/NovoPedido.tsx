import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
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
import { formatarQuantidade } from "../../utils/format";

const novoPedidoSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecione um cliente"),
    data_pedido: z.string().min(1, "Informe a data do pedido"),
    data_prevista_entrega: z.string().min(1, "Informe o prazo de entrega"),
    observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
    itens: z
      .array(
        z.object({
          produto_id: z.string().min(1, "Selecione o produto"),
          quantidade: z
            .string()
            .min(1, "Informe a quantidade")
            .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
        }),
      )
      .min(1, "Informe ao menos um produto"),
  })
  .refine((dados) => dados.data_prevista_entrega >= dados.data_pedido, {
    message: "O prazo não pode ser anterior à data do pedido",
    path: ["data_prevista_entrega"],
  });

type NovoPedidoForm = z.infer<typeof novoPedidoSchema>;

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
      itens: [{ produto_id: "", quantidade: "" }],
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
              return (
                <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-start">
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
                      onClick={() => remove(i)}
                      disabled={fields.length === 1}
                      aria-label={`Remover produto ${i + 1}`}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
            {errors.itens?.root?.message && (
              <p role="alert" className="text-xs text-danger">
                {errors.itens.root.message}
              </p>
            )}
            <Button variant="ghost" onClick={() => append({ produto_id: "", quantidade: "" })} disabled={semProdutos}>
              + Adicionar produto
            </Button>
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
