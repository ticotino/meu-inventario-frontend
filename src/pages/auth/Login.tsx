import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordVisibilityButton } from "../../components/ui/PasswordVisibilityButton";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useAuth } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(254, "O e-mail é muito longo"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginLocationState {
  cadastroConcluido?: boolean;
  email?: string;
}

export function Login() {
  useDocumentTitle("Entrar");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LoginLocationState | null;
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso] = useState<string | null>(() =>
    locationState?.cadastroConcluido
      ? "Conta criada com sucesso. Entre com suas credenciais."
      : null,
  );
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: locationState?.email ?? "", senha: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    setFocus("email");
    if (location.state) navigate("/login", { replace: true, state: null });
  }, [location.state, navigate, setFocus]);

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
    <AuthShell
      title="Meu Inventário"
      description="Entre com suas credenciais para continuar."
      context="login"
    >
      <div className="space-y-4">
        {sucesso && <SuccessBanner>{sucesso}</SuccessBanner>}

        <form
          onSubmit={handleSubmit(onSubmit, (errors) => setFocus(errors.email ? "email" : "senha"))}
          className="space-y-4"
          noValidate
          aria-busy={isSubmitting}
        >
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
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
            error={errors.senha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={mostrarSenha}
                onToggle={() => setMostrarSenha((visivel) => !visivel)}
              />
            }
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
    </AuthShell>
  );
}
