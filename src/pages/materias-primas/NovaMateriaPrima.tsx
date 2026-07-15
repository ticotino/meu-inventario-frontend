import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useFabricantes } from "../../hooks/useFabricantes";
import { useCreateMateriaPrima } from "../../hooks/useMateriasPrimas";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import { UNIDADES_MEDIDA, UNIDADE_MEDIDA_LABELS } from "../../types/materiaPrima";

const novaMateriaPrimaSchema = z.object({
  fabricante_id: z.string().min(1, "Selecione um fabricante"),
  nome_tecido: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres")
    .max(120, "O nome deve ter no máximo 120 caracteres"),
  cor: z.string().trim().max(60, "A cor é muito longa").optional(),
  unidade_medida: z.enum(UNIDADES_MEDIDA),
  quantidade_recebida: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
  estoque_minimo: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) >= 0, "O estoque mínimo não pode ser negativo"),
  valor_unitario: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) >= 0, "O valor não pode ser negativo"),
  data_recebimento: z.string().min(1, "Informe a data de recebimento"),
  observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
});

type NovaMateriaPrimaForm = z.infer<typeof novaMateriaPrimaSchema>;

function hoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function NovaMateriaPrima() {
  useDocumentTitle("Nova matéria-prima");
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const { data: fabricantes, isPending: carregandoFabricantes } = useFabricantes();
  const criar = useCreateMateriaPrima();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovaMateriaPrimaForm>({
    resolver: zodResolver(novaMateriaPrimaSchema),
    defaultValues: { unidade_medida: "metro", data_recebimento: hoje() },
  });

  const semFabricantes = !carregandoFabricantes && (fabricantes?.length ?? 0) === 0;

  async function onSubmit(dados: NovaMateriaPrimaForm) {
    setErro(null);
    try {
      const criada = await criar.mutateAsync({
        fabricante_id: dados.fabricante_id,
        nome_tecido: dados.nome_tecido,
        cor: dados.cor || undefined,
        unidade_medida: dados.unidade_medida,
        quantidade_recebida: Number(dados.quantidade_recebida),
        estoque_minimo: dados.estoque_minimo ? Number(dados.estoque_minimo) : undefined,
        valor_unitario: dados.valor_unitario ? Number(dados.valor_unitario) : undefined,
        data_recebimento: dados.data_recebimento,
        observacoes: dados.observacoes || undefined,
      });
      navigate(`/materias-primas/${criada.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível registrar a matéria-prima."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Nova matéria-prima"
        descricao="Registre a chegada de um tecido ou insumo. O código MP- é gerado automaticamente e a quantidade recebida entra como saldo disponível."
        action={
          <Link to="/materias-primas" className="text-sm font-medium text-action hover:underline">
            Voltar à lista
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Select
            id="mp-fabricante"
            label="Fabricante"
            required
            disabled={semFabricantes}
            error={errors.fabricante_id?.message}
            hint={
              semFabricantes ? (
                <>
                  Nenhum fabricante ativo.{" "}
                  <Link to="/fabricantes" className="font-medium text-action hover:underline">
                    Cadastre um fabricante
                  </Link>{" "}
                  antes de registrar a matéria-prima.
                </>
              ) : undefined
            }
            defaultValue=""
            {...register("fabricante_id")}
          >
            <option value="" disabled>
              {carregandoFabricantes ? "Carregando..." : "Selecione..."}
            </option>
            {fabricantes?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </Select>

          <Input
            id="mp-nome-tecido"
            label="Nome do tecido"
            type="text"
            required
            maxLength={120}
            error={errors.nome_tecido?.message}
            {...register("nome_tecido")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="mp-cor"
              label="Cor"
              type="text"
              maxLength={60}
              hint="Opcional."
              error={errors.cor?.message}
              {...register("cor")}
            />

            <Select id="mp-unidade" label="Unidade de medida" required error={errors.unidade_medida?.message} {...register("unidade_medida")}>
              {UNIDADES_MEDIDA.map((unidade) => (
                <option key={unidade} value={unidade}>
                  {UNIDADE_MEDIDA_LABELS[unidade]}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="mp-quantidade"
              label="Quantidade recebida"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              required
              error={errors.quantidade_recebida?.message}
              {...register("quantidade_recebida")}
            />

            <Input
              id="mp-valor"
              label="Valor unitário (R$)"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              hint="Valor por unidade de medida (opcional)."
              error={errors.valor_unitario?.message}
              {...register("valor_unitario")}
            />
          </div>

          <Input
            id="mp-estoque-minimo"
            label="Estoque mínimo"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            hint="Opcional. O item será sinalizado quando o saldo for igual ou inferior a este valor."
            error={errors.estoque_minimo?.message}
            {...register("estoque_minimo")}
          />

          <Input
            id="mp-data"
            label="Data de recebimento"
            type="date"
            required
            error={errors.data_recebimento?.message}
            {...register("data_recebimento")}
          />

          <Textarea
            id="mp-observacoes"
            label="Observações"
            maxLength={1000}
            error={errors.observacoes?.message}
            {...register("observacoes")}
          />

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} loadingText="Registrando..." disabled={semFabricantes}>
            Registrar matéria-prima
          </Button>
        </form>
      </div>
    </div>
  );
}
