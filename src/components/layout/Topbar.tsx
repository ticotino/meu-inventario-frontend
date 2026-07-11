import { useAuth } from "../../contexts/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { usuario, logout } = useAuth();

  return (
    <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        aria-label="Abrir menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{usuario?.nome}</p>
          <p className="text-xs text-slate-500">{usuario?.papel === "admin" ? "Administrador" : "Funcionário"}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
