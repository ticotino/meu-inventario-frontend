import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { fieldErrorClass, feedbackErrorClass, labelClass } from "../../components/ui/formStyles";
import { useCreatePrestador, useUpdatePrestador } from "../../hooks/usePrestadores";
import { getApiErrorMessage } from "../../services/api";
import { TIPOS_SERVICO_PRESTADOR, TIPO_SERVICO_PRESTADOR_LABEL } from "../../types/prestador";
import type { Prestador, PrestadorInput, PrestadorUpdateInput, TipoServicoPrestador } from "../../types/prestador";
import { prestadorSchema } from "./prestadorSchema";
import type { PrestadorFormData } from "./prestadorSchema";

function paraCriacao(dados: PrestadorFormData): PrestadorInput {
  return {
    nome: dados.nome,
    contato: dados.contato || undefined,
    telefone: dados.telefone || undefined,
    email: dados.email || undefined,
    tipos_servico: dados.tipos_servico,
  };
}

// Na edição "" significa "limpar o campo": envia null explicitamente, em vez
// de undefined (que o backend interpretaria como "manter o valor atual").
function paraEdicao(dados: PrestadorFormData): PrestadorUpdateInput {
  return {
    nome: dados.nome,
    contato: dados.contato || null,
    telefone: dados.telefone || null,
    email: dados.email || null,
    tipos_servico: dados.tipos_servico,
  };
}

interface PrestadorFormProps {
  prestador?: Prestador;
  onSuccess: (prestador: Prestador) => void;
  onCancel: () => void;
}

export function PrestadorForm({ prestador, onSuccess, onCancel }: PrestadorFormProps) {
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCreatePrestador();
  const atualizar = useUpdatePrestador();

  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PrestadorFormData>({
    resolver: zodResolver(prestadorSchema),
    defaultValues: {
      nome: prestador?.nome ?? "",
      contato: prestador?.contato ?? "",
      telefone: prestador?.telefone ?? "",
      email: prestador?.email ?? "",
      tipos_servico: prestador?.tipos_servico ?? [],
    },
  });

  useEffect(() => {
    setFocus("nome");
  }, [setFocus]);

  const tiposSelecionados = useWatch({ control, name: "tipos_servico" });

  function alternarTipo(tipo: TipoServicoPrestador, marcado: boolean) {
    const atual = tiposSelecionados ?? [];
    setValue(
      "tipos_servico",
      marcado ? [...atual, tipo] : atual.filter((t) => t !== tipo),
      { shouldValidate: true },
    );
  }

  async function onSubmit(dados: PrestadorFormData) {
    setErro(null);
    try {
      const salvo = prestador
        ? await atualizar.mutateAsync({ id: prestador.id, input: paraEdicao(dados) })
        : await criar.mutateAsync(paraCriacao(dados));
      onSuccess(salvo);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível salvar o prestador."));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-medium text-ink">{prestador ? `Editar "${prestador.nome}"` : "Novo prestador"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate aria-busy={isSubmitting}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="prestador-nome"
            label="Nome"
            type="text"
            required
            maxLength={160}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <Input
            id="prestador-contato"
            label="Contato"
            type="text"
            maxLength={120}
            hint="Nome da pessoa de contato (opcional)."
            error={errors.contato?.message}
            {...register("contato")}
          />
          <Input
            id="prestador-telefone"
            label="Telefone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            error={errors.telefone?.message}
            {...register("telefone")}
          />
          <Input
            id="prestador-email"
            label="E-mail"
            type="email"
            maxLength={254}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>Tipos de serviço</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {TIPOS_SERVICO_PRESTADOR.map((tipo) => (
              <label key={tipo} className="inline-flex items-center gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-control-border text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
                  checked={tiposSelecionados?.includes(tipo) ?? false}
                  onChange={(event) => alternarTipo(tipo, event.target.checked)}
                />
                {TIPO_SERVICO_PRESTADOR_LABEL[tipo]}
              </label>
            ))}
          </div>
          {errors.tipos_servico?.message && (
            <p role="alert" className={fieldErrorClass}>
              {errors.tipos_servico.message}
            </p>
          )}
        </fieldset>

        {erro && (
          <p role="alert" className={feedbackErrorClass}>
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" loading={isSubmitting} loadingText="Salvando...">
            {prestador ? "Salvar alterações" : "Cadastrar prestador"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
