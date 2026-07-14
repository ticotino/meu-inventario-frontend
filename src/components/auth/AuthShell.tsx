import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthShellSize = "compact" | "wide";
type AuthContext = "login" | "invite" | "admin-access";

interface AuthShellProps {
  title: string;
  description: string;
  context: AuthContext;
  size?: AuthShellSize;
  children: ReactNode;
}

const sizeClasses: Record<AuthShellSize, string> = {
  compact: "max-w-sm",
  wide: "max-w-xl",
};

const alignmentClasses: Record<AuthShellSize, string> = {
  compact: "items-center",
  wide: "items-start sm:items-center",
};

const linkClass =
  "inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-action transition-colors hover:text-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none";

function AdminNavigation() {
  return (
    <nav aria-label="Gestão de acessos" className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-page p-1">
      <Link to="/" className={`${linkClass} justify-center text-body hover:bg-surface hover:text-ink`}>
        Voltar ao sistema
      </Link>
      <span
        aria-current="page"
        className="flex min-h-11 items-center justify-center rounded-md bg-action px-3 py-2 text-sm font-medium text-surface"
      >
        Gerenciar acessos
      </span>
    </nav>
  );
}

function AuthFooter({ context }: { context: Exclude<AuthContext, "admin-access"> }) {
  const isLogin = context === "login";
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      <span className="text-sm text-body">
        {isLogin ? "Recebeu um convite?" : "Já tem uma conta?"}
      </span>
      <Link to={isLogin ? "/cadastro" : "/login"} className={linkClass}>
        {isLogin ? "Criar conta" : "Entrar na sua conta"}
      </Link>
    </footer>
  );
}

export function AuthShell({
  title,
  description,
  context,
  size = "compact",
  children,
}: AuthShellProps) {
  return (
    <main className={`flex min-h-screen justify-center bg-page px-4 py-8 sm:px-6 ${alignmentClasses[size]}`}>
      <div className={`w-full ${sizeClasses[size]} rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8`}>
        <header>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 max-w-prose text-sm leading-5 text-muted">{description}</p>
        </header>

        {context === "admin-access" && <AdminNavigation />}

        <div className="mt-6">{children}</div>

        {context !== "admin-access" && <AuthFooter context={context} />}
      </div>
    </main>
  );
}
