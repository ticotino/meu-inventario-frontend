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

type CadastroForm = z.infer<typeof cadastroSchema>;

const recoveryLinkClass =
  "inline-flex min-h-11 items-center rounded-md font-semibold text-action underline decoration-1 underline-offset-4 hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2";

export function Cadastro() {
  useDocumentTitle("Aceitar convite");
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);
  const [invite, setInvite] = useState<ConviteData | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nome: "", senha: "", confirmarSenha: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    let active = true;

    async function loadInvite() {
      if (!token) {
        setFatalError("Este endereço não contém um convite. Peça um novo link ao administrador.");
        setLoadingInvite(false);
        return;
      }

      try {
        const data = await getConvite(token);
        if (!active) return;
        setInvite(data);
      } catch (error) {
        if (!active) return;
        const invalidToken = axios.isAxiosError(error) && error.response?.status === 400;
        setFatalError(
          invalidToken
            ? "Convite inválido ou não encontrado. Peça um novo link ao administrador."
            : getApiErrorMessage(error, "Não foi possível validar este convite."),
        );
      } finally {
        if (active) setLoadingInvite(false);
      }
    }

    void loadInvite();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (fatalError) errorRef.current?.focus();
    else if (invite) form.setFocus("nome");
  }, [fatalError, form, invite]);

  async function onSubmit(data: CadastroForm) {
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
        setInvite(null);
        setFatalError(message);
        return;
      }
      setSubmitError(message);
    }
  }

  return (
    <AuthShell
      title="Aceitar convite"
      description="Defina seus dados para acessar o inventário como funcionário."
      context="invite"
      size="wide"
    >
      {loadingInvite && (
        <p role="status" aria-live="polite" className="rounded-md bg-page px-3 py-3 text-sm text-body">
          Validando convite...
        </p>
      )}

      {!loadingInvite && fatalError && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-md bg-danger-bg p-4 text-sm leading-6 text-danger-strong outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2">
          <p className="font-semibold">Não foi possível usar este convite.</p>
          <p className="mt-1">{fatalError}</p>
          <Link to="/login" className={recoveryLinkClass}>
            Voltar para o login
          </Link>
        </div>
      )}

      {!loadingInvite && invite && (
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const firstError = (["nome", "senha", "confirmarSenha"] as const).find((field) => errors[field]);
            if (firstError) form.setFocus(firstError);
          })}
          className="space-y-4"
          noValidate
          aria-busy={form.formState.isSubmitting}
        >
          <Input
            id="invite-account-email"
            label="E-mail convidado"
            type="email"
            readOnly
            value={invite.email}
            hint={`Este convite expira em ${new Intl.DateTimeFormat("pt-BR", {
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
            error={form.formState.errors.nome?.message}
            {...form.register("nome")}
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
            error={form.formState.errors.senha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={showPassword}
                onToggle={() => setShowPassword((visible) => !visible)}
              />
            }
            {...form.register("senha")}
          />

          <Input
            id="confirmar-senha"
            label="Confirmar senha"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={128}
            error={form.formState.errors.confirmarSenha?.message}
            endAdornment={
              <PasswordVisibilityButton
                visible={showConfirmation}
                onToggle={() => setShowConfirmation((visible) => !visible)}
              />
            }
            {...form.register("confirmarSenha")}
          />

          {submitError && (
            <p role="alert" className={feedbackErrorClass}>
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            fullWidth
            loading={form.formState.isSubmitting}
            loadingText="Criando conta..."
          >
            Criar conta de funcionário
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
