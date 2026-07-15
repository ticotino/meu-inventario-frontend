import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BeneficiamentoDetalhe } from "./BeneficiamentoDetalhe";
import type { Beneficiamento } from "../../types/beneficiamento";

const useBeneficiamentoMock = vi.fn();
const receberMutateAsync = vi.fn();
const cancelarMutateAsync = vi.fn();

vi.mock("../../hooks/useBeneficiamentos", () => ({
  useBeneficiamento: (...args: unknown[]) => useBeneficiamentoMock(...args),
  useReceberBeneficiamento: () => ({ mutateAsync: receberMutateAsync, isPending: false }),
  useCancelarBeneficiamento: () => ({ mutateAsync: cancelarMutateAsync, isPending: false }),
}));

const beneficiamentoEnviado: Beneficiamento = {
  id: "b1",
  codigo: "BEN-000001",
  producao_id: "prod-1",
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
    <MemoryRouter initialEntries={["/beneficiamento/b1"]}>
      <Routes>
        <Route path="/beneficiamento/:id" element={<BeneficiamentoDetalhe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("BeneficiamentoDetalhe — ações de status", () => {
  beforeEach(() => {
    receberMutateAsync.mockReset();
    cancelarMutateAsync.mockReset();
    useBeneficiamentoMock.mockReturnValue({
      data: beneficiamentoEnviado,
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
    await user.type(screen.getByLabelText("Quantidade recebida"), "150");
    await user.click(screen.getByRole("button", { name: "Confirmar recebimento" }));

    expect(await screen.findByText(/Não é possível receber mais do que foi enviado/)).toBeInTheDocument();
    expect(receberMutateAsync).not.toHaveBeenCalled();
  });

  it("mostra aviso não bloqueante e envia quando a quantidade recebida é menor", async () => {
    receberMutateAsync.mockResolvedValueOnce({ ...beneficiamentoEnviado, status: "recebido" });
    const user = userEvent.setup();
    renderDetalhe();

    await user.click(screen.getByRole("button", { name: "Marcar como recebido" }));
    await user.type(screen.getByLabelText("Quantidade recebida"), "80");

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

  it("não mostra ações de status quando o beneficiamento já foi recebido", () => {
    useBeneficiamentoMock.mockReturnValue({
      data: { ...beneficiamentoEnviado, status: "recebido", quantidade_recebida: "100" },
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
