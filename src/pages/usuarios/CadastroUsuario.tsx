import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordVisibilityButton } from "../../components/ui/PasswordVisibilityButton";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import { createConvite, createUsuario } from "../../services/usuariosService";

const adminSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(120, "O nome deve ter no máximo 120 caracteres"),
  email: z.string().trim().email("Informe um e-mail válido").max(160, "O e-mail é muito longo"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(128, "A senha é muito longa"),
});

const inviteSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido").max(160, "O e-mail é muito longo"),
  papel: z.enum(["admin", "funcionario"]),
});

type AdminForm = z.infer<typeof adminSchema>;
type InviteForm = z.infer<typeof inviteSchema>;

interface GeneratedInvite {
  email: string;
  papel: "admin" | "funcionario";
  url: string;
  expiraEm: string;
}

export function CadastroUsuario() {
  useDocumentTitle("Gerenciar acessos");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<GeneratedInvite | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const adminForm = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { nome: "", email: "", senha: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", papel: "funcionario" },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!generatedInvite) return;
    const frame = window.requestAnimationFrame(() => linkInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [generatedInvite]);

  async function submitAdmin(data: AdminForm) {
    setAdminError(null);
    setAdminSuccess(null);
    try {
      await createUsuario({ ...data, papel: "admin" });
      setAdminSuccess("Administrador criado com sucesso.");
      setShowPassword(false);
      adminForm.reset();
      adminForm.setFocus("nome");
    } catch (error) {
      setAdminError(getApiErrorMessage(error, "Não foi possível criar o administrador."));
    }
  }

  async function submitInvite(data: InviteForm) {
    setInviteError(null);
    setCopyFeedback(null);
    setGeneratedInvite(null);
    try {
      const invite = await createConvite(data.email, data.papel);
      setGeneratedInvite({
        email: data.email.trim().toLowerCase(),
        papel: data.papel,
        url: new URL(`/cadastro/${invite.token}`, window.location.origin).toString(),
        expiraEm: invite.expiraEm,
      });
      inviteForm.reset({ email: "", papel: "funcionario" });
    } catch (error) {
      setInviteError(getApiErrorMessage(error, "Não foi possível gerar o convite."));
    }
  }

  async function copyInviteLink() {
    if (!generatedInvite) return;
    setCopyFeedback(null);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard indisponível");
      await navigator.clipboard.writeText(generatedInvite.url);
      setCopyFeedback("Link copiado para a área de transferência.");
    } catch {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
      setCopyFeedback("Não foi possível copiar automaticamente. O link foi selecionado para cópia manual.");
    }
  }

  return (
    <AuthShell
      title="Gerenciar acessos"
      description="Crie administradores diretamente ou envie convites individuais com o acesso correto."
      context="admin-access"
      size="wide"
    >
      <div className="space-y-8">
        <section aria-labelledby="admin-heading">
          <h2 id="admin-heading" className="text-lg font-semibold text-ink">
            Criar administrador
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted">
            Administradores acessam todas as áreas e podem gerenciar outras contas.
          </p>

          <div className="mt-5 space-y-4">
            {adminSuccess && <SuccessBanner>{adminSuccess}</SuccessBanner>}

            <form
              onSubmit={adminForm.handleSubmit(submitAdmin, (errors) => {
                const firstError = (["nome", "email", "senha"] as const).find((field) => errors[field]);
                if (firstError) adminForm.setFocus(firstError);
              })}
              className="space-y-4"
              noValidate
              aria-busy={adminForm.formState.isSubmitting}
            >
              <Input
                id="admin-nome"
                label="Nome completo"
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                error={adminForm.formState.errors.nome?.message}
                {...adminForm.register("nome")}
              />

              <Input
                id="admin-email"
                label="E-mail"
                type="email"
                autoComplete="username"
                required
                maxLength={160}
                error={adminForm.formState.errors.email?.message}
                {...adminForm.register("email")}
              />

              <Input
                id="admin-senha"
                label="Senha inicial"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                maxLength={128}
                hint="Use de 6 a 128 caracteres."
                error={adminForm.formState.errors.senha?.message}
                endAdornment={
                  <PasswordVisibilityButton
                    visible={showPassword}
                    onToggle={() => setShowPassword((visible) => !visible)}
                  />
                }
                {...adminForm.register("senha")}
              />

              {adminError && (
                <p role="alert" className={feedbackErrorClass}>
                  {adminError}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                loading={adminForm.formState.isSubmitting}
                loadingText="Criando administrador..."
              >
                Criar administrador
              </Button>
            </form>
          </div>
        </section>

        <section aria-labelledby="invite-heading" className="border-t border-border pt-8">
          <h2 id="invite-heading" className="text-lg font-semibold text-ink">
            Convidar usuário
          </h2>
          <p id="invite-description" className="mt-1 text-sm leading-5 text-muted">
            Escolha o acesso antes de gerar o link. Ele funciona uma vez, vale por 7 dias e um novo convite para o mesmo e-mail revoga o anterior.
          </p>

          <form
            onSubmit={inviteForm.handleSubmit(submitInvite, () => inviteForm.setFocus("email"))}
            className="mt-5 space-y-4"
            noValidate
            aria-describedby="invite-description"
            aria-busy={inviteForm.formState.isSubmitting}
          >
            <Input
              id="invite-email"
              label="E-mail da pessoa convidada"
              type="email"
              autoComplete="email"
              required
              maxLength={160}
              error={inviteForm.formState.errors.email?.message}
              {...inviteForm.register("email")}
            />

            <fieldset>
              <legend className="text-sm font-medium text-body">Tipo de conta</legend>
              <p id="invite-role-hint" className="mt-1 text-sm leading-5 text-muted">
                O papel ficará gravado no convite e não poderá ser alterado no cadastro.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border border-control-border bg-surface p-3 transition-colors hover:bg-page focus-within:ring-2 focus-within:ring-action focus-within:ring-offset-2 has-[:checked]:border-action has-[:checked]:bg-page motion-reduce:transition-none">
                  <input
                    type="radio"
                    value="funcionario"
                    aria-describedby="invite-role-hint"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-action"
                    {...inviteForm.register("papel")}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">Funcionário</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">
                      Opera o inventário sem gerenciar contas.
                    </span>
                  </span>
                </label>

                <label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border border-control-border bg-surface p-3 transition-colors hover:bg-page focus-within:ring-2 focus-within:ring-action focus-within:ring-offset-2 has-[:checked]:border-action has-[:checked]:bg-page motion-reduce:transition-none">
                  <input
                    type="radio"
                    value="admin"
                    aria-describedby="invite-role-hint"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-action"
                    {...inviteForm.register("papel")}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">Administrador</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">
                      Acessa todas as áreas e gerencia usuários.
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            {inviteError && (
              <p role="alert" className={feedbackErrorClass}>
                {inviteError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              loading={inviteForm.formState.isSubmitting}
              loadingText="Gerando convite..."
            >
              Gerar convite
            </Button>
          </form>

          {generatedInvite && (
            <div className="mt-5 space-y-3 rounded-md border border-border bg-page p-4">
              <Input
                ref={linkInputRef}
                id="invite-link"
                label="Link de convite"
                type="text"
                readOnly
                value={generatedInvite.url}
                hint={`Conta de ${generatedInvite.papel === "admin" ? "administrador" : "funcionário"} vinculada a ${generatedInvite.email}. Expira em ${new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(generatedInvite.expiraEm))}.`}
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button type="button" variant="secondary" fullWidth onClick={copyInviteLink}>
                Copiar link
              </Button>
              {copyFeedback && (
                <p role="status" aria-live="polite" className="text-sm leading-5 text-body">
                  {copyFeedback}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </AuthShell>
  );
}
