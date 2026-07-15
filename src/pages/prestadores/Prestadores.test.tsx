import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prestadores } from "./Prestadores";
import type { Prestador } from "../../types/prestador";

const usePrestadoresMock = vi.fn();

vi.mock("../../hooks/usePrestadores", () => ({
  usePrestadores: (...args: unknown[]) => usePrestadoresMock(...args),
  useDeactivatePrestador: () => ({ mutateAsync: vi.fn(), isPending: false, variables: undefined }),
  useUpdatePrestador: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const prestadores: Prestador[] = [
  {
    id: "p1",
    nome: "Ateliê da Maria",
    contato: null,
    telefone: null,
    email: null,
    tipos_servico: ["costura_externa"],
    ativo: true,
    criado_em: "2026-01-01T00:00:00Z",
  },
];

function renderPrestadores() {
  return render(
    <MemoryRouter>
      <Prestadores />
    </MemoryRouter>,
  );
}

describe("Prestadores", () => {
  beforeEach(() => {
    usePrestadoresMock.mockReset();
  });

  it("mostra o skeleton de carregamento", () => {
    usePrestadoresMock.mockReturnValue({ isPending: true, isError: false, data: undefined, refetch: vi.fn() });
    renderPrestadores();
    expect(screen.getByRole("status", { name: /Carregando/i })).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há prestadores", () => {
    usePrestadoresMock.mockReturnValue({ isPending: false, isError: false, data: [], refetch: vi.fn() });
    renderPrestadores();
    expect(screen.getByText("Nenhum prestador ainda")).toBeInTheDocument();
  });

  it("mostra a tabela populada com os prestadores", () => {
    usePrestadoresMock.mockReturnValue({ isPending: false, isError: false, data: prestadores, refetch: vi.fn() });
    renderPrestadores();
    expect(screen.getAllByText("Ateliê da Maria").length).toBeGreaterThan(0);
  });

  it("mostra o estado de erro com opção de tentar novamente", () => {
    const refetch = vi.fn();
    usePrestadoresMock.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("falha"),
      data: undefined,
      refetch,
    });
    renderPrestadores();
    expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeInTheDocument();
  });
});
