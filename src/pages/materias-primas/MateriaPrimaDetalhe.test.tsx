import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MateriaPrimaDetalhe } from "./MateriaPrimaDetalhe";
import type { MateriaPrima } from "../../types/materiaPrima";
import type { MovimentacaoEstoque } from "../../types/movimentacaoEstoque";

const useMateriaPrimaMock = vi.fn();
const useMovimentacoesEstoqueMock = vi.fn();

vi.mock("../../hooks/useMateriasPrimas", () => ({
  useMateriaPrima: (...args: unknown[]) => useMateriaPrimaMock(...args),
  useUpdateMateriaPrima: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("../../hooks/useMovimentacoesEstoque", () => ({
  useMovimentacoesEstoque: (...args: unknown[]) => useMovimentacoesEstoqueMock(...args),
}));

const materiaPrima: MateriaPrima = {
  id: "mp-1",
  codigo: "MP-000001",
  fabricante_id: "fab-1",
  fabricante_nome: "Tecidos Fabricante A",
  nome_tecido: "Malha PV",
  cor: "Branco",
  unidade_medida: "metro",
  quantidade_recebida: "200",
  quantidade_disponivel: "150",
  estoque_minimo: "50",
  estoque_baixo: false,
  valor_unitario: "12.5",
  data_recebimento: "2026-01-01",
  observacoes: null,
  largura_rolo_cm: null,
  ativo: true,
  criado_por: "user-1",
  criado_em: "2026-01-01T00:00:00Z",
};

function recebimento(parcial: Partial<MovimentacaoEstoque>): MovimentacaoEstoque {
  return {
    id: "mov-1",
    tipo: "entrada_compra",
    direcao: "entrada",
    item_tipo: "materia_prima",
    item_id: "mp-1",
    item_codigo: "MP-000001",
    item_nome: "Malha PV",
    item_unidade_medida: "metro",
    materia_prima_id: "mp-1",
    produto_id: null,
    quantidade: "100",
    saldo_resultante: "250",
    referencia_tipo: null,
    referencia_id: null,
    referencia_codigo: null,
    nota_fiscal: null,
    valor_unitario: null,
    usuario_id: "user-1",
    usuario_nome: "Ana",
    criado_em: "2026-07-01T00:00:00Z",
    ...parcial,
  };
}

function renderDetalhe() {
  return render(
    <MemoryRouter initialEntries={["/materias-primas/mp-1"]}>
      <Routes>
        <Route path="/materias-primas/:id" element={<MateriaPrimaDetalhe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("MateriaPrimaDetalhe — histórico de recebimentos", () => {
  beforeEach(() => {
    useMateriaPrimaMock.mockReturnValue({
      data: materiaPrima,
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });
  });

  it("exibe nota fiscal e valor de cada remessa recebida", () => {
    useMovimentacoesEstoqueMock.mockReturnValue({
      data: {
        itens: [recebimento({ nota_fiscal: "NF-999", valor_unitario: "18.9" })],
        proximo_cursor: null,
      },
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderDetalhe();

    expect(screen.getAllByText("NF-999").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/18,90/).length).toBeGreaterThan(0);
  });

  it("mostra travessão quando a remessa não tem nota fiscal nem valor", () => {
    useMovimentacoesEstoqueMock.mockReturnValue({
      data: {
        itens: [recebimento({ nota_fiscal: null, valor_unitario: null })],
        proximo_cursor: null,
      },
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderDetalhe();

    const linhas = screen.getAllByText("—");
    expect(linhas.length).toBeGreaterThan(0);
  });

  it("mostra o empty-state quando nenhuma remessa foi recebida ainda", () => {
    useMovimentacoesEstoqueMock.mockReturnValue({
      data: { itens: [], proximo_cursor: null },
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });

    renderDetalhe();

    expect(screen.getByText("Nenhuma reposição recebida ainda")).toBeInTheDocument();
  });
});
