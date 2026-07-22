import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServicoExternoDetalhe } from "./ServicoExternoDetalhe";
import type { ServicoExterno } from "../../types/servicoExterno";

const useServicoExternoMock = vi.fn();
const receberMutateAsync = vi.fn();
const cancelarMutateAsync = vi.fn();

vi.mock("../../hooks/useServicosExternos", () => ({
  useServicoExterno: (...args: unknown[]) => useServicoExternoMock(...args),
  useReceberServicoExterno: () => ({ mutateAsync: receberMutateAsync, isPending: false }),
  useCancelarServicoExterno: () => ({ mutateAsync: cancelarMutateAsync, isPending: false }),
}));

const servicoExternoEnviado: ServicoExterno = {
  id: "b1",
  codigo: "SEX-000001",
  producao_id: "prod-1",
  pedido_item_id: null,
  prestador_id: "prest-1",
  tipo: "silk",
  status: "enviado",
  quantidade_enviada: "100",
  quantidade_recebida: null,
  data_envio: "2026-07-01",
  data_recebimento_prevista: null,
  data_recebimento: null,
  valor_cobrado: null,
  nota_fiscal: null,
  observacoes: null,
  criado_por: "u1",
  criado_em: "2026-07-01T00:00:00Z",
  atualizado_em: "2026-07-01T00:00:00Z",
  recebido_em: null,
  cancelado_em: null,
  producao_codigo: "PRD-000001",
  produto_nome: "Camiseta P",
  prestador_nome: "Silk Estampa",
  usuario_nome: "Ana",
};

function renderDetalhe() {
  return render(
    <MemoryRouter initialEntries={["/servicos-externos/b1"]}>
      <Routes>
        <Route path="/servicos-externos/:id" element={<ServicoExternoDetalhe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ServicoExternoDetalhe — ações de status", () => {
  beforeEach(() => {
    receberMutateAsync.mockReset();
    cancelarMutateAsync.mockReset();
    useServicoExternoMock.mockReturnValue({
      data: servicoExternoEnviado,
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });
  });

  it("bloqueia o envio quando a quantidade recebida excede a enviada", async () => {
    const user = userEvent.setup();
    renderDetalhe();

    await user.click(screen.getByRole("button", { name: "Marcar como recebido" }));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "150");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(await screen.findByText(/Não é possível receber mais do que foi enviado/)).toBeInTheDocument();
    expect(receberMutateAsync).not.toHaveBeenCalled();
  });

  it("mostra aviso não bloqueante e envia quando a quantidade recebida é menor", async () => {
    receberMutateAsync.mockResolvedValueOnce({ ...servicoExternoEnviado, status: "recebido" });
    const user = userEvent.setup();
    renderDetalhe();

    await user.click(screen.getByRole("button", { name: "Marcar como recebido" }));
    await user.type(screen.getByLabelText(/Quantidade recebida/), "80");

    expect(await screen.findByText(/a menos que o enviado \(perda no processo\)/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    await waitFor(() => expect(receberMutateAsync).toHaveBeenCalledTimes(1));
    expect(receberMutateAsync).toHaveBeenCalledWith({
      id: "b1",
      input: { quantidade_recebida: 80, valor_cobrado: undefined, nota_fiscal: undefined },
    });
  });

  it("só mostra 'Cancelar envio' quando o status é 'enviado'", () => {
    renderDetalhe();
    expect(screen.getByRole("button", { name: "Cancelar envio" })).toBeInTheDocument();
  });

  it("não mostra ações de status quando o serviço externo já foi recebido", () => {
    useServicoExternoMock.mockReturnValue({
      data: { ...servicoExternoEnviado, status: "recebido", quantidade_recebida: "100" },
      isPending: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    });
    renderDetalhe();
    expect(screen.queryByRole("button", { name: "Marcar como recebido" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancelar envio" })).not.toBeInTheDocument();
  });
});
