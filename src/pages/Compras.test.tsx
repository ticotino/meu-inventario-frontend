import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Compras } from "./Compras";
import type { NecessidadeCompra } from "../types/compra";

const useComprasMock = vi.fn();
const criarMutateAsync = vi.fn();
const receberMutateAsync = vi.fn();
const cancelarMutateAsync = vi.fn();
const usePedidosMock = vi.fn();

vi.mock("../hooks/useCompras", () => ({
  useCompras: () => useComprasMock(),
  useCriarSolicitacaoCompra: () => ({ mutateAsync: criarMutateAsync, isPending: false }),
  useReceberSolicitacaoCompra: () => ({ mutateAsync: receberMutateAsync, isPending: false }),
  useCancelarSolicitacaoCompra: () => ({ mutateAsync: cancelarMutateAsync, isPending: false }),
}));

vi.mock("../hooks/usePedidos", () => ({
  usePedidos: (...args: unknown[]) => usePedidosMock(...args),
}));

const itemComSolicitacao: NecessidadeCompra = {
  materia_prima_id: "mp-1",
  codigo: "MP-000001",
  nome_tecido: "Malha PV",
  cor: "Branco",
  unidade_medida: "metro",
  quantidade_disponivel: "10",
  estoque_minimo: "50",
  quantidade_sugerida: "90",
  fabricante_id: "fab-1",
  fabricante_nome: "Tecidos Fabricante A",
  solicitacao_id: "sol-1",
  quantidade_solicitada: "100",
  quantidade_recebida: null,
  solicitacao_status: "solicitado",
  solicitacao_observacoes: null,
  solicitacao_criado_por: "user-1",
  solicitacao_criado_por_nome: "Ana",
  solicitacao_criado_em: "2026-07-01T00:00:00Z",
  reservas: [],
};

function renderCompras() {
  return render(<Compras />);
}

describe("Compras — recebimento de solicitação", () => {
  beforeEach(() => {
    criarMutateAsync.mockReset();
    receberMutateAsync.mockReset();
    cancelarMutateAsync.mockReset();
    useComprasMock.mockReturnValue({
      data: [itemComSolicitacao],
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });
    usePedidosMock.mockReturnValue({
      data: [
        { id: "pedido-1", codigo: "PED-0001", cliente_nome: "Cliente A" },
        { id: "pedido-2", codigo: "PED-0002", cliente_nome: "Cliente B" },
      ],
    });
  });

  it("envia nota fiscal e valor unitário opcionais junto do recebimento", async () => {
    const user = userEvent.setup();
    renderCompras();

    await user.clear(screen.getByLabelText(/Quantidade recebida/));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "100");
    await user.type(screen.getByLabelText(/Nota fiscal/), "NF-12345");
    await user.type(screen.getByLabelText(/Valor unitário/), "15.5");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(receberMutateAsync).toHaveBeenCalledTimes(1);
    expect(receberMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sol-1",
        quantidade_recebida: 100,
        nota_fiscal: "NF-12345",
        valor_unitario: 15.5,
      }),
    );
  });

  it("recebe normalmente sem nota fiscal nem valor informados", async () => {
    const user = userEvent.setup();
    renderCompras();

    await user.clear(screen.getByLabelText(/Quantidade recebida/));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "100");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(receberMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        nota_fiscal: undefined,
        valor_unitario: undefined,
        reservas: undefined,
      }),
    );
  });

  it("reserva parte da quantidade recebida para um pedido pendente", async () => {
    const user = userEvent.setup();
    renderCompras();

    await user.clear(screen.getByLabelText(/Quantidade recebida/));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "100");
    await user.click(screen.getByLabelText(/Reservar esta remessa/));
    await user.selectOptions(screen.getByLabelText("Pedido 1"), "pedido-1");
    await user.type(screen.getByLabelText(/Quantidade reservada/), "40");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(receberMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        reservas: [{ pedido_id: "pedido-1", quantidade_reservada: 40 }],
      }),
    );
  });

  it("bloqueia o recebimento quando a soma das reservas excede a quantidade recebida", async () => {
    const user = userEvent.setup();
    renderCompras();

    await user.clear(screen.getByLabelText(/Quantidade recebida/));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "100");
    await user.click(screen.getByLabelText(/Reservar esta remessa/));
    await user.selectOptions(screen.getByLabelText("Pedido 1"), "pedido-1");
    await user.type(screen.getByLabelText(/Quantidade reservada/), "150");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(await screen.findByText(/não pode ser maior que a quantidade recebida/)).toBeInTheDocument();
    expect(receberMutateAsync).not.toHaveBeenCalled();
  });
});
