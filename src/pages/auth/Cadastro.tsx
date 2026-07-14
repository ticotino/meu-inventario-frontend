import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordVisibilityButton } from "../../components/ui/PasswordVisibilityButton";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import { acceptConvite, getConvite } from "../../services/authService";
import type { ConviteData } from "../../services/authService";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

const conviteInputSchema = z.object({
  convite: z.string().trim().min(1, "Cole o link ou código do convite"),
});

const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(120, "O nome deve ter no máximo 120 caracteres"),
    senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type ConviteInputForm = z.infer<typeof conviteInputSchema>;
type CadastroForm = z.infer<typeof cadastroSchema>;

interface InviteResult {
  token: string;
  data?: ConviteData;
  error?: string;
}

const recoveryLinkClass =
  "inline-flex min-h-11 items-center rounded-md font-semibold text-action underline decoration-1 underline-offset-4 hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2";

function extractToken(value: string): string | null {
  const normalized = value.trim();
  if (TOKEN_PATTERN.test(normalized)) return normalized.toLowerCase();

  try {
    const url = new URL(normalized, window.location.origin);
    const segments = url.pathname.split("/").filter(Boolean);
    const candidate = segments.at(-1) ?? "";
    return TOKEN_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function Cadastro() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const inviteInputForm = useForm<ConviteInputForm>({
    resolver: zodResolver(conviteInputSchema),
    defaultValues: { convite: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const accountForm = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", senha: "", confirmarSenha: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const currentResult = token && inviteResult?.token === token ? inviteResult : null;
  const invite = currentResult?.data ?? null;
  const fatalError = currentResult?.error ?? null;
  const loadingInvite = Boolean(token && !currentResult);
  const accountType = invite?.papel === "admin" ? "administrador" : "funcionário";
  const title = invite ? `Criar conta de ${accountType}` : "Criar conta";
  useDocumentTitle(title);

  useEffect(() => {
    let active = true;

    async function loadInvite() {
      if (!token) return;

      try {
        const data = await getConvite(token);
        if (active) setInviteResult({ token, data });
      } catch (error) {
        if (!active) return;
        const invalidToken = axios.isAxiosError(error) && error.response?.status === 400;
        setInviteResult({
          token,
          error: invalidToken
            ? "Convite inválido ou não encontrado. Peça um novo link ao administrador."
            : getApiErrorMessage(error, "Não foi possível validar este convite."),
        });
      }
    }

    void loadInvite();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (fatalError) errorRef.current?.focus();
    else if (invite) accountForm.setFocus("nome");
    else if (!loadingInvite) inviteInputForm.setFocus("convite");
  }, [accountForm, fatalError, invite, inviteInputForm, loadingInvite]);

  function continueWithInvite(data: ConviteInputForm) {
    const parsedToken = extractToken(data.convite);
    if (!parsedToken) {
      inviteInputForm.setError("convite", {
        type: "validate",
        message: "Informe um link ou código de convite válido",
      });
      inviteInputForm.setFocus("convite");
      return;
    }
    navigate(`/cadastro/${parsedToken}`);
  }

  async function createAccount(data: CadastroForm) {
    if (!token || !invite) return;
    setSubmitError(null);
    try {
      await acceptConvite(token, { nome: data.nome, senha: data.senha });
      navigate("/login", {
        replace: true,
        state: {
          cadastroConcluido: true,
          email: invite.email,
        },
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível criar a conta.");
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 410)) {
        setInviteResult({ token, error: message });
        return;
      }
      setSubmitError(message);
    }
  }

  return (
    <AuthShell
      title={title}
      description={
        invite
          ? `Preencha seus dados para acessar o sistema como ${accountType}.`
          : "Use o convite enviado pelo administrador para começar."
      }
      context="invite"
      size="wide"
    >
      {loadingInvite && (
        <p role="status" aria-live="polite" className="rounded-md bg-page px-3 py-3 text-sm text-body">
          Validando convite...
        </p>
      )}

      {!loadingInvite && !token && (
        <form
          onSubmit={inviteInputForm.handleSubmit(continueWithInvite, () => inviteInputForm.setFocus("convite"))}
          className="space-y-4"
          noValidate
        >
          <Input
            id="convite"
            label="Link ou código do convite"
            type="text"
            autoComplete="off"
            required
            hint="Cole o link completo ou o código recebido do administrador."
            error={inviteInputForm.formState.errors.convite?.message}
            {...inviteInputForm.register("convite")}
          />
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Continuar
            </Button>
          </div>
        </form>
      )}

      {!loadingInvite && fatalError && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md bg-danger-bg p-4 text-sm leading-6 text-danger-strong outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
        >
          <p className="font-semibold">Não foi possível usar este convite.</p>
          <p className="mt-1">{fatalError}</p>
          <Link to="/cadastro" className={recoveryLinkClass}>
            Usar outro convite
          </Link>
        </div>
      )}

      {!loadingInvite && invite && (
        <form
          onSubmit={accountForm.handleSubmit(createAccount, (errors) => {
            const firstError = (["nome", "senha", "confirmarSenha"] as const).find((field) => errors[field]);
            if (firstError) accountForm.setFocus(firstError);
          })}
          className="space-y-4"
          noValidate
          aria-busy={accountForm.formState.isSubmitting}
        >
          <div className="rounded-md border border-border bg-page px-3 py-3 text-sm leading-5 text-body">
            Este convite cria uma conta de <strong className="font-semibold text-ink">{accountType}</strong>.
          </div>

          <Input
            id="invite-account-email"
            label="E-mail convidado"
            type="email"
            readOnly
            value={invite.email}
            hint={`O convite expira em ${new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(invite.expiraEm))}.`}
          />

          <Input
            id="nome"
            label="Nome completo"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            error={accountForm.formState.errors.nome?.message}
            {...accountForm.register("nome")}
          />

          <Input
            id="senha"
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={128}
            hint="Use de 6 a 128 caracteres."
            error={accountForm.formState.errors.senha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
            }
            {...accountForm.register("senha")}
          />

          <Input
            id="confirmar-senha"
            label="Confirmar senha"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={128}
            error={accountForm.formState.errors.confirmarSenha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={showConfirmation}
                onToggle={() => setShowConfirmation((visible) => !visible)}
              />
            }
            {...accountForm.register("confirmarSenha")}
          />

          {submitError && (
            <p role="alert" className={feedbackErrorClass}>
              {submitError}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={accountForm.formState.isSubmitting}
              loadingText="Criando conta..."
              className="w-full sm:w-auto"
            >
              Criar conta
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
