import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useCreateCliente, useUpdateCliente } from "../../hooks/useClientes";
import { getApiErrorMessage } from "../../services/api";
import type { Cliente, ClienteInput, ClienteUpdateInput } from "../../types/cliente";

const clienteSchema = z.object({
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

type ClienteFormData = z.infer<typeof clienteSchema>;

function paraCriacao(dados: ClienteFormData): ClienteInput {
  return {
    nome: dados.nome,
    contato: dados.contato || undefined,
    telefone: dados.telefone || undefined,
    email: dados.email || undefined,
  };
}

// Na edição "" significa "limpar o campo": envia null explicitamente, em vez
// de undefined (que o backend interpretaria como "manter o valor atual").
function paraEdicao(dados: ClienteFormData): ClienteUpdateInput {
  return {
    nome: dados.nome,
    contato: dados.contato || null,
    telefone: dados.telefone || null,
    email: dados.email || null,
  };
}

interface ClienteFormProps {
  cliente?: Cliente;
  onSuccess: (cliente: Cliente) => void;
  onCancel: () => void;
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCreateCliente();
  const atualizar = useUpdateCliente();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome ?? "",
      contato: cliente?.contato ?? "",
      telefone: cliente?.telefone ?? "",
      email: cliente?.email ?? "",
    },
  });

  useEffect(() => {
    setFocus("nome");
  }, [setFocus]);

  async function onSubmit(dados: ClienteFormData) {
    setErro(null);
    try {
      const salvo = cliente
        ? await atualizar.mutateAsync({ id: cliente.id, input: paraEdicao(dados) })
        : await criar.mutateAsync(paraCriacao(dados));
      onSuccess(salvo);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível salvar o cliente."));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-medium text-ink">{cliente ? `Editar "${cliente.nome}"` : "Novo cliente"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate aria-busy={isSubmitting}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="cliente-nome"
            label="Nome"
            type="text"
            autoComplete="off"
            required
            maxLength={160}
            error={errors.nome?.message}
            {...register("nome")}
          />
          <Input
            id="cliente-contato"
            label="Contato"
            type="text"
            maxLength={120}
            hint="Nome da pessoa de contato (opcional)."
            error={errors.contato?.message}
            {...register("contato")}
          />
          <Input
            id="cliente-telefone"
            label="Telefone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            error={errors.telefone?.message}
            {...register("telefone")}
          />
          <Input
            id="cliente-email"
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
            {cliente ? "Salvar alterações" : "Cadastrar cliente"}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
