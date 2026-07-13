import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(254, "O e-mail é muito longo"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  useDocumentTitle("Entrar");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  async function onSubmit(dados: LoginForm) {
    setErro(null);
    try {
      await login(dados.email, dados.senha);
      navigate("/", { replace: true });
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível entrar. Verifique seus dados."));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-card">
        <h1 className="text-xl font-semibold text-ink">Meu Inventário</h1>
        <p className="mt-1 text-sm text-muted">Entre com suas credenciais para continuar.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate aria-busy={isSubmitting}>
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
            autoComplete="current-password"
            required
            maxLength={128}
            error={errors.senha?.message}
            {...register("senha")}
          />

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button type="submit" fullWidth loading={isSubmitting} loadingText="Entrando...">
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
