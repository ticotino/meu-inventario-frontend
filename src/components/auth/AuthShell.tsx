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

const navigationItemClass =
  "flex min-h-11 items-center justify-center rounded-md px-3 py-2 text-sm font-medium";

function AuthNavigation({ context }: { context: AuthContext }) {
  if (context === "admin-access") {
    return (
      <nav aria-label="Acesso à conta" className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-page p-1">
        <Link
          to="/"
          className={`${navigationItemClass} text-body transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none`}
        >
          Voltar ao sistema
        </Link>
        <span aria-current="page" className={`${navigationItemClass} bg-action text-surface`}>
          Gerenciar acessos
        </span>
      </nav>
    );
  }

  if (context === "invite") {
    return (
      <nav aria-label="Acesso à conta" className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-page p-1">
        <Link
          to="/login"
          className={`${navigationItemClass} text-body transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none`}
        >
          Entrar
        </Link>
        <span aria-current="page" className={`${navigationItemClass} bg-action text-surface`}>
          Aceitar convite
        </span>
      </nav>
    );
  }

  return (
    <div className="mt-6">
      <nav aria-label="Acesso à conta" className="rounded-md bg-page p-1">
        <span aria-current="page" className={`${navigationItemClass} bg-action text-surface`}>
          Entrar
        </span>
      </nav>
      <p className="mt-3 text-sm leading-5 text-muted">
        Contas de funcionários são criadas por convite enviado pelo administrador.
      </p>
    </div>
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
          <h1 className="text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 max-w-prose text-sm text-muted">{description}</p>
        </header>

        <AuthNavigation context={context} />

        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
