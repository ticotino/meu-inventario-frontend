import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function NotFound() {
  useDocumentTitle("Página não encontrada");

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-card">
        <h1 className="text-xl font-semibold text-ink">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted">
          O endereço informado não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-action px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-action-hover active:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
