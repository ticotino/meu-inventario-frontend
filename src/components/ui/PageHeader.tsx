import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  action?: ReactNode;
}

export function PageHeader({ titulo, descricao, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-muted">{descricao}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
