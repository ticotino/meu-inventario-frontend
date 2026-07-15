import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrestadorForm } from "./PrestadorForm";
import type { Prestador } from "../../types/prestador";

const criarMutateAsync = vi.fn();
const atualizarMutateAsync = vi.fn();

vi.mock("../../hooks/usePrestadores", () => ({
  useCreatePrestador: () => ({ mutateAsync: criarMutateAsync, isPending: false }),
  useUpdatePrestador: () => ({ mutateAsync: atualizarMutateAsync, isPending: false }),
}));

const prestadorExistente: Prestador = {
  id: "p1",
  nome: "Ateliê da Maria",
  contato: "Maria",
  telefone: "11999990000",
  email: "maria@example.com",
  tipos_servico: ["costura_externa", "bordado"],
  ativo: true,
  criado_em: "2026-01-01T00:00:00Z",
};

describe("PrestadorForm", () => {
  beforeEach(() => {
    criarMutateAsync.mockReset();
    atualizarMutateAsync.mockReset();
  });

  it("mostra erro e não envia quando o nome é muito curto", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<PrestadorForm onSuccess={onSuccess} onCancel={() => {}} />);

    await user.type(screen.getByLabelText(/^Nome$/), "A");
    await user.click(screen.getByRole("checkbox", { name: "Silk" }));
    await user.click(screen.getByRole("button", { name: /Cadastrar prestador/i }));

    expect(await screen.findByText("Informe ao menos 2 caracteres")).toBeInTheDocument();
    expect(criarMutateAsync).not.toHaveBeenCalled();
  });

  it("mostra erro e não envia quando nenhum tipo de serviço é selecionado", async () => {
    const user = userEvent.setup();
    render(<PrestadorForm onSuccess={vi.fn()} onCancel={() => {}} />);

    await user.type(screen.getByLabelText(/^Nome$/), "Ateliê Nova");
    await user.click(screen.getByRole("button", { name: /Cadastrar prestador/i }));

    expect(await screen.findByText("Selecione ao menos um tipo de serviço")).toBeInTheDocument();
    expect(criarMutateAsync).not.toHaveBeenCalled();
  });

  it("envia o payload esperado ao cadastrar com dados válidos", async () => {
    criarMutateAsync.mockResolvedValueOnce(prestadorExistente);
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<PrestadorForm onSuccess={onSuccess} onCancel={() => {}} />);

    await user.type(screen.getByLabelText(/^Nome$/), "Ateliê da Maria");
    await user.click(screen.getByRole("checkbox", { name: "Costura externa" }));
    await user.click(screen.getByRole("button", { name: /Cadastrar prestador/i }));

    await waitFor(() => expect(criarMutateAsync).toHaveBeenCalledTimes(1));
    expect(criarMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Ateliê da Maria", tipos_servico: ["costura_externa"] }),
    );
    expect(onSuccess).toHaveBeenCalledWith(prestadorExistente);
  });

  it("pré-preenche os campos e os tipos de serviço no modo edição", () => {
    render(<PrestadorForm prestador={prestadorExistente} onSuccess={vi.fn()} onCancel={() => {}} />);

    expect(screen.getByLabelText(/^Nome$/)).toHaveValue("Ateliê da Maria");
    expect(screen.getByRole("checkbox", { name: "Costura externa" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Bordado" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Silk" })).not.toBeChecked();
  });
});
