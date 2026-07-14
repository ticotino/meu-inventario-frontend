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
import {
  forgetRememberedAccount,
  getRememberedAccount,
  rememberAccount,
} from "../../services/rememberedAccount";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(254, "O e-mail é muito longo"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginLocationState {
  cadastroConcluido?: boolean;
  email?: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("") || "MI";
}

export function Login() {
  useDocumentTitle("Entrar");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LoginLocationState | null;
  const [remembered, setRemembered] = useState(getRememberedAccount);
  const [usingRemembered, setUsingRemembered] = useState(
    Boolean(remembered && !locationState?.email),
  );
  const [error, setError] = useState<string | null>(null);
  const [success] = useState<string | null>(() =>
    locationState?.cadastroConcluido
      ? "Conta criada com sucesso. Entre com suas credenciais."
      : null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: locationState?.email ?? remembered?.email ?? "",
      senha: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    form.setFocus(usingRemembered ? "senha" : "email");
  }, [form, usingRemembered]);

  useEffect(() => {
    if (location.state) navigate("/login", { replace: true, state: null });
  }, [location.state, navigate]);

  function switchToAnotherAccount() {
    setUsingRemembered(false);
    setError(null);
    setShowPassword(false);
    form.reset({ email: "", senha: "" });
  }

  function removeRememberedAccount() {
    forgetRememberedAccount();
    setRemembered(null);
    switchToAnotherAccount();
  }

  async function onSubmit(data: LoginForm) {
    setError(null);
    try {
      const user = await login(data.email, data.senha);
      rememberAccount(user);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Não foi possível entrar. Verifique seus dados."));
    }
  }

  return (
    <AuthShell
      title="Entrar"
      description={usingRemembered ? "Digite sua senha para continuar." : "Acesse sua conta do Meu Inventário."}
      context="login"
    >
      <div className="space-y-5">
        {success && <SuccessBanner>{success}</SuccessBanner>}

        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const firstError = errors.email ? "email" : "senha";
            form.setFocus(firstError);
          })}
          className="space-y-4"
          noValidate
          aria-busy={form.formState.isSubmitting}
        >
          {usingRemembered && remembered ? (
            <>
              <input type="hidden" {...form.register("email")} />
              <div
                role="group"
                aria-label={`Conta lembrada de ${remembered.nome}`}
                className="flex min-h-16 items-center gap-3 rounded-md border border-border bg-page p-3"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar text-sm font-semibold text-sidebar-text-strong"
                >
                  {getInitials(remembered.nome)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-body">
                    Bem-vindo de volta, <strong className="font-semibold text-ink">{remembered.nome}</strong>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted">{remembered.email}</span>
                </span>
                <button
                  type="button"
                  onClick={removeRememberedAccount}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-md px-2 text-sm font-semibold text-danger-strong transition-colors hover:bg-danger-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Remover
                </button>
              </div>
            </>
          ) : (
            <Input
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
          )}

          <Input
            id="senha"
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
            error={form.formState.errors.senha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
            }
            {...form.register("senha")}
          />

          {error && (
            <p role="alert" className={feedbackErrorClass}>
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {usingRemembered && (
              <Button type="button" variant="secondary" onClick={switchToAnotherAccount} className="w-full sm:w-auto">
                Entrar com outra conta
              </Button>
            )}
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              loadingText="Entrando..."
              className="w-full sm:w-auto"
            >
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
