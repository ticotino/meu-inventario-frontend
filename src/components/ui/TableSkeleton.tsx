interface TableSkeletonProps {
  linhas?: number;
}

export function TableSkeleton({ linhas = 5 }: TableSkeletonProps) {
  return (
    <div role="status" aria-label="Carregando...">
      <div className="hidden rounded-lg border border-border bg-surface p-4 shadow-card sm:block">
        <div className="animate-pulse space-y-3 motion-reduce:animate-none">
          <div className="h-4 w-1/3 rounded bg-border" />
          {Array.from({ length: linhas }, (_, i) => (
            <div key={i} className="h-9 rounded bg-border/60" />
          ))}
        </div>
      </div>
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="animate-pulse space-y-2 motion-reduce:animate-none">
              <div className="h-4 w-2/3 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-border/60" />
              <div className="h-3 w-1/3 rounded bg-border/60" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
