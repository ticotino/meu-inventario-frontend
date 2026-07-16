import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useCreateFabricante, useUpdateFabricante } from "../../hooks/useFabricantes";
import { getApiErrorMessage } from "../../services/api";
import type { Fabricante, FabricanteInput, FabricanteUpdateInput } from "../../types/fabricante";

const fabricanteSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(160, "O nome deve ter no máximo 160 caracteres"),
  contato: z.string().trim().max(120, "O contato é muito longo").optional(),
  telefone: z.string().trim().max(30, "O telefone é muito longo").optional(),
  email: z
    .string()
    .trim()
    .max(254, "O e-mail é muito longo")
    .refine((valor) => valor === "" || z.string().email().safeParse(valor).success, "Informe um e-mail válido")
    .optional(),
});

type FabricanteFormData = z.infer<typeof fabricanteSchema>;

function paraCriacao(dados: FabricanteFormData): FabricanteInput {
  return {
    nome: dados.nome,
    contato: dados.contato || undefined,
    telefone: dados.telefone || undefined,
    email: dados.email || undefined,
  };
}

// Na edição "" significa "limpar o campo": envia null explicitamente, em vez
// de undefined (que o backend interpretaria como "manter o valor atual").
function paraEdicao(dados: FabricanteFormData): FabricanteUpdateInput {
  return {
    nome: dados.nome,
    contato: dados.contato || null,
    telefone: dados.telefone || null,
    email: dados.email || null,
  };
}

interface FabricanteFormProps {
  fabricante?: Fabricante;
  onSuccess: (fabricante: Fabricante) => void;
  onCancel: () => void;
}

export function FabricanteForm({ fabricante, onSuccess, onCancel }: FabricanteFormProps) {
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCreateFabricante();
  const atualizar = useUpdateFabricante();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FabricanteFormData>({
    resolver: zodResolver(fabricanteSchema),
    defaultValues: {
      nome: fabricante?.nome ?? "",
      contato: fabricante?.contato ?? "",
      telefone: fabricante?.telefone ?? "",
      email: fabricante?.email ?? "",
    },
  });

  useEffect(() => {
    setFocus("nome");
  }, [setFocus]);

  async function onSubmit(dados: FabricanteFormData) {
    setErro(null);
    try {
      const salvo = fabricante
        ? await atualizar.mutateAsync({ id: fabricante.id, input: paraEdicao(dados) })
        : await criar.mutateAsync(paraCriacao(dados));
      onSuccess(salvo);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível salvar o fabricante."));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-medium text-ink">{fabricante ? `Editar "${fabricante.nome}"` : "Novo fabricante"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate aria-busy={isSubmitting}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="fabricante-nome"
            label="Nome"
            type="text"
            autoComplete="off"
            required
            maxLength={160}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <Input
            id="fabricante-contato"
            label="Contato"
            type="text"
            maxLength={120}
            hint="Nome da pessoa de contato (opcional)."
            error={errors.contato?.message}
            {...register("contato")}
          />
          <Input
            id="fabricante-telefone"
            label="Telefone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            error={errors.telefone?.message}
            {...register("telefone")}
          />
          <Input
            id="fabricante-email"
            label="E-mail"
            type="email"
            autoComplete="off"
            maxLength={254}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        {erro && (
          <p role="alert" className={feedbackErrorClass}>
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" loading={isSubmitting} loadingText="Salvando...">
            {fabricante ? "Salvar alterações" : "Cadastrar fabricante"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
