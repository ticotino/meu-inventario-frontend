import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import { createUsuario } from "../../services/usuariosService";

const cadastroSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Informe um e-mail válido").max(254, "O e-mail é muito longo"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
  papel: z.enum(["admin", "funcionario"]),
});

type CadastroForm = z.infer<typeof cadastroSchema>;

export function CadastroUsuario() {
  useDocumentTitle("Novo usuário");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { papel: "admin" },
  });

  async function onSubmit(dados: CadastroForm) {
    setErro(null);
    setSucesso(null);
    try {
      const usuario = await createUsuario(dados);
      setSucesso(`Usuário "${usuario.nome}" criado com sucesso.`);
      reset({ nome: "", email: "", senha: "", papel: "admin" });
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível criar o usuário."));
    }
  }

  return (
    <div>
      <PageHeader titulo="Novo usuário" descricao="Cadastre um novo administrador ou funcionário." />

      <div className="mt-6 max-w-md rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Input
            id="nome"
            label="Nome"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            error={errors.nome?.message}
            {...register("nome")}
          />

          <Input
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="senha"
            label="Senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={128}
            hint="Use de 6 a 128 caracteres."
            error={errors.senha?.message}
            {...register("senha")}
          />

          <Select id="papel" label="Papel" required error={errors.papel?.message} {...register("papel")}>
            <option value="admin">Administrador</option>
            <option value="funcionario">Funcionário</option>
          </Select>

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}
          {sucesso && <SuccessBanner>{sucesso}</SuccessBanner>}

          <Button type="submit" fullWidth loading={isSubmitting} loadingText="Criando...">
            Criar usuário
          </Button>
        </form>
      </div>
    </div>
  );
}
