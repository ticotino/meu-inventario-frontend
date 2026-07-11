interface EmBreveProps {
  titulo: string;
}

export function EmBreve({ titulo }: EmBreveProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <h1 className="text-lg font-semibold text-slate-800">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-500">Esta seção será implementada na próxima etapa.</p>
    </div>
  );
}
