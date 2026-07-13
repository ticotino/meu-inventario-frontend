import type { ReactNode } from "react";

interface EmptyStateProps {
  titulo: string;
  descricao: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ titulo, descricao, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-control-border bg-surface p-10 text-center">
      <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{descricao}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
