import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { FormErrorBanner } from "../../components/ui/FormErrorBanner";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useMateriasPrimas } from "../../hooks/useMateriasPrimas";
import { useCreateProducao } from "../../hooks/useProducoes";
import { useProdutos } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";
import { formatarQuantidade } from "../../utils/format";

const novaProducaoSchema = z.object({
  produto_id: z.string().min(1, "Selecione um produto"),
  quantidade_produzida: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
  data_producao: z.string().min(1, "Informe a data da produção"),
  observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
  itens: z
    .array(
      z.object({
        materia_prima_id: z.string().min(1, "Selecione a matéria-prima"),
        quantidade_consumida: z
          .string()
          .min(1, "Informe a quantidade")
          .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
      }),
    )
    .min(1, "Informe ao menos uma matéria-prima"),
});

type NovaProducaoForm = z.infer<typeof novaProducaoSchema>;

function hoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function NovaProducao() {
  useDocumentTitle("Registrar produção");
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const { data: produtos, isPending: carregandoProdutos } = useProdutos({ ativo: true });
  const { data: materiasPrimas, isPending: carregandoMps } = useMateriasPrimas({ ativo: true });
  const criar = useCreateProducao();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NovaProducaoForm>({
    resolver: zodResolver(novaProducaoSchema),
    defaultValues: {
      produto_id: "",
      quantidade_produzida: "",
      data_producao: hoje(),
      observacoes: "",
      itens: [{ materia_prima_id: "", quantidade_consumida: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itensSelecionados = useWatch({ control, name: "itens" });

  const semProdutos = !carregandoProdutos && (produtos?.length ?? 0) === 0;
  const semMps = !carregandoMps && (materiasPrimas?.length ?? 0) === 0;
  const mpPorId = new Map(materiasPrimas?.map((mp) => [mp.id, mp]) ?? []);

  async function onSubmit(dados: NovaProducaoForm) {
    setErro(null);

    // Validações que dependem dos dados carregados (duplicata e saldo);
    // o backend continua sendo a fonte da verdade.
    let temErroItem = false;
    const vistos = new Set<string>();
    dados.itens.forEach((item, i) => {
      if (vistos.has(item.materia_prima_id)) {
        setError(`itens.${i}.materia_prima_id`, { message: "Matéria-prima repetida" }, { shouldFocus: true });
        temErroItem = true;
      }
      vistos.add(item.materia_prima_id);

      const mp = mpPorId.get(item.materia_prima_id);
      if (mp && Number(item.quantidade_consumida) > Number(mp.quantidade_disponivel)) {
        setError(
          `itens.${i}.quantidade_consumida`,
          {
            message: `Saldo insuficiente — disponível ${formatarQuantidade(mp.quantidade_disponivel, mp.unidade_medida)}`,
          },
          { shouldFocus: true },
        );
        temErroItem = true;
      }
    });
    if (temErroItem) return;

    try {
      const criada = await criar.mutateAsync({
        produto_id: dados.produto_id,
        quantidade_produzida: Number(dados.quantidade_produzida),
        data_producao: dados.data_producao,
        observacoes: dados.observacoes || undefined,
        itens: dados.itens.map((item) => ({
          materia_prima_id: item.materia_prima_id,
          quantidade_consumida: Number(item.quantidade_consumida),
        })),
      });
      navigate(`/producao/${criada.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível registrar a produção."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Registrar produção"
        descricao="A quantidade produzida entra no estoque do produto e as matérias-primas consumidas são baixadas do estoque."
        action={
          <Link to="/producao" className="text-sm font-medium text-action hover:underline">
            Voltar ao registro
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Select
            id="producao-produto"
            label="Produto"
            required
            disabled={semProdutos}
            error={errors.produto_id?.message}
            hint={
              semProdutos ? (
                <>
                  Nenhum produto ativo.{" "}
                  <Link to="/producao/produtos/novo" className="font-medium text-action hover:underline">
                    Cadastre um produto
                  </Link>{" "}
                  antes de registrar a produção.
                </>
              ) : undefined
            }
            {...register("produto_id")}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="producao-quantidade"
              label="Quantidade produzida"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              required
              error={errors.quantidade_produzida?.message}
              {...register("quantidade_produzida")}
            />

            <Input
              id="producao-data"
              label="Data da produção"
              type="date"
              required
              error={errors.data_producao?.message}
              {...register("data_producao")}
            />
          </div>

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-body">Matérias-primas consumidas</legend>
            {semMps && (
              <p className="text-xs text-muted">
                Nenhuma matéria-prima ativa em estoque.{" "}
                <Link to="/materias-primas/nova" className="font-medium text-action hover:underline">
                  Registre uma entrada
                </Link>{" "}
                antes de produzir.
              </p>
            )}
            {fields.map((field, i) => {
              const mpSelecionada = mpPorId.get(itensSelecionados?.[i]?.materia_prima_id ?? "");
              return (
                <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-start">
                  <Select
                    id={`producao-item-mp-${i}`}
                    label={`Matéria-prima ${i + 1}`}
                    required
                    disabled={semMps}
                    error={errors.itens?.[i]?.materia_prima_id?.message}
                    {...register(`itens.${i}.materia_prima_id`)}
                  >
                    <option value="" disabled>
                      {carregandoMps ? "Carregando..." : "Selecione..."}
                    </option>
                    {materiasPrimas?.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.codigo} · {mp.nome_tecido}
                        {mp.cor ? ` (${mp.cor})` : ""}
                      </option>
                    ))}
                  </Select>
                  <div className="sm:w-44">
                    <Input
                      id={`producao-item-qtd-${i}`}
                      label="Quantidade"
                      type="number"
                      step="0.001"
                      min="0"
                      inputMode="decimal"
                      required
                      hint={
                        mpSelecionada
                          ? `Disponível: ${formatarQuantidade(mpSelecionada.quantidade_disponivel, mpSelecionada.unidade_medida)}`
                          : undefined
                      }
                      error={errors.itens?.[i]?.quantidade_consumida?.message}
                      {...register(`itens.${i}.quantidade_consumida`)}
                    />
                  </div>
                  <div className="sm:pt-6">
                    <Button
                      variant="ghost-danger"
                      onClick={() => remove(i)}
                      disabled={fields.length === 1}
                      aria-label={`Remover matéria-prima ${i + 1}`}
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
            <Button
              variant="ghost"
              onClick={() => append({ materia_prima_id: "", quantidade_consumida: "" })}
              disabled={semMps}
            >
              + Adicionar matéria-prima
            </Button>
          </fieldset>

          <Textarea
            id="producao-observacoes"
            label="Observações"
            maxLength={1000}
            hint="Opcional."
            error={errors.observacoes?.message}
            {...register("observacoes")}
          />

          <FormErrorBanner message={erro} />

          <Button type="submit" loading={isSubmitting} loadingText="Registrando..." disabled={semProdutos || semMps}>
            Registrar produção
          </Button>
        </form>
      </div>
    </div>
  );
}
