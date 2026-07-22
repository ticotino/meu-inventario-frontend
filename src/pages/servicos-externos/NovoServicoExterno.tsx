import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useCreateServicoExterno } from "../../hooks/useServicosExternos";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePedido, usePedidos } from "../../hooks/usePedidos";
import { usePrestadores } from "../../hooks/usePrestadores";
import { useProducao, useProducoes } from "../../hooks/useProducoes";
import { getApiErrorMessage } from "../../services/api";
import { TIPOS_SERVICO_EXTERNO } from "../../types/servicoExterno";
import type { TipoServicoExterno } from "../../types/servicoExterno";
import { formatarQuantidade } from "../../utils/format";
import { quantidadeEnviadaValida } from "./servicoExternoValidacao";
import { novoServicoExternoSchema } from "./novoServicoExternoSchema";
import type { NovoServicoExternoForm } from "./novoServicoExternoSchema";
import { TIPO_SERVICO_EXTERNO_LABEL } from "./tipoServicoExterno";

function hoje(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function NovoServicoExterno() {
  useDocumentTitle("Enviar para serviço externo");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [erro, setErro] = useState<string | null>(null);
  const [producaoId, setProducaoId] = useState(searchParams.get("producao") ?? "");
  // Origem opcional a partir de um item de pedido pendente: não substitui a
  // Produção (ainda obrigatória — é de onde a peça física saiu), só registra
  // qual item do pedido este envio está atendendo.
  const [origemPedidoId, setOrigemPedidoId] = useState(searchParams.get("pedido") ?? "");
  const [pedidoItemId, setPedidoItemId] = useState(searchParams.get("pedido_item") ?? "");

  const { data: producoes, isPending: carregandoProducoes } = useProducoes({});
  const { data: producao, isPending: carregandoProducao } = useProducao(producaoId || undefined);
  const { data: prestadores, isPending: carregandoPrestadores } = usePrestadores();
  const { data: pedidosPendentes } = usePedidos({ status: "pendente" });
  const { data: pedidoOrigem, isPending: carregandoPedidoOrigem } = usePedido(origemPedidoId || undefined);
  const criar = useCreateServicoExterno();

  const itensElegiveis =
    pedidoOrigem?.itens.filter((item) => item.destino_servico_externo !== "nenhum" && !item.servico_externo) ?? [];

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NovoServicoExternoForm>({
    resolver: zodResolver(novoServicoExternoSchema),
    defaultValues: {
      producao_id: producaoId,
      prestador_id: "",
      tipo: undefined,
      quantidade_enviada: "",
      data_envio: hoje(),
      data_recebimento_prevista: "",
      valor_cobrado: "",
      nota_fiscal: "",
      observacoes: "",
    },
  });

  const tipoEscolhido = useWatch({ control, name: "tipo" });
  const prestadoresDoTipo = prestadores?.filter((p) => !tipoEscolhido || p.tipos_servico.includes(tipoEscolhido));

  const semProducoes = !carregandoProducoes && (producoes?.length ?? 0) === 0;
  const semPrestadores = !carregandoPrestadores && (prestadores?.length ?? 0) === 0;

  async function onSubmit(dados: NovoServicoExternoForm) {
    setErro(null);

    // Checagem client-side contra o que a produção gerou; o backend
    // continua sendo a fonte da verdade.
    if (producao && !quantidadeEnviadaValida(Number(dados.quantidade_enviada), Number(producao.quantidade_produzida))) {
      setError("quantidade_enviada", {
        message: `Disponível: ${formatarQuantidade(producao.quantidade_produzida, "unidade")}`,
      });
      return;
    }

    try {
      const criado = await criar.mutateAsync({
        producao_id: dados.producao_id,
        pedido_item_id: pedidoItemId || undefined,
        prestador_id: dados.prestador_id,
        tipo: dados.tipo,
        quantidade_enviada: Number(dados.quantidade_enviada),
        data_envio: dados.data_envio,
        data_recebimento_prevista: dados.data_recebimento_prevista || undefined,
        valor_cobrado: dados.valor_cobrado ? Number(dados.valor_cobrado) : undefined,
        nota_fiscal: dados.nota_fiscal || undefined,
        observacoes: dados.observacoes || undefined,
      });
      navigate(`/servicos-externos/${criado.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível registrar o serviço externo."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Enviar para serviço externo"
        descricao="Registre o envio de peças de uma produção para costura externa, silk ou bordado."
        action={
          <Link to="/servicos-externos" className="text-sm font-medium text-action hover:underline">
            Voltar ao registro
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Select
            id="servico-externo-producao"
            label="Produção"
            required
            disabled={semProducoes}
            error={errors.producao_id?.message}
            hint={
              semProducoes ? (
                <>
                  Nenhuma produção registrada.{" "}
                  <Link to="/producao/nova" className="font-medium text-action hover:underline">
                    Registre uma produção
                  </Link>{" "}
                  antes de enviar para serviço externo.
                </>
              ) : undefined
            }
            value={producaoId}
            {...register("producao_id", {
              onChange: (event) => setProducaoId(event.target.value),
            })}
          >
            <option value="" disabled>
              {carregandoProducoes ? "Carregando..." : "Selecione..."}
            </option>
            {producoes?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} · {p.produto_nome}
              </option>
            ))}
          </Select>

          {producaoId && carregandoProducao && <p className="text-sm text-muted">Carregando dados da produção...</p>}

          <fieldset className="space-y-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-body">Origem no pedido (opcional)</legend>
            <p className="text-xs text-muted">
              Vincule este envio a um item de pedido que já espera acabamento, para acompanhar o status a partir do
              pedido.
            </p>
            <Select
              id="servico-externo-origem-pedido"
              label="Pedido"
              value={origemPedidoId}
              onChange={(event) => {
                setOrigemPedidoId(event.target.value);
                setPedidoItemId("");
              }}
            >
              <option value="">Nenhum</option>
              {pedidosPendentes?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} · {p.cliente_nome}
                </option>
              ))}
            </Select>
            {origemPedidoId && (
              <Select
                id="servico-externo-origem-item"
                label="Item do pedido"
                disabled={carregandoPedidoOrigem}
                value={pedidoItemId}
                onChange={(event) => setPedidoItemId(event.target.value)}
              >
                <option value="">{carregandoPedidoOrigem ? "Carregando..." : "Selecione..."}</option>
                {itensElegiveis.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.codigo} · {item.nome} —{" "}
                    {TIPO_SERVICO_EXTERNO_LABEL[item.destino_servico_externo as TipoServicoExterno]}
                  </option>
                ))}
              </Select>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="servico-externo-tipo"
              label="Tipo"
              required
              error={errors.tipo?.message}
              {...register("tipo")}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {TIPOS_SERVICO_EXTERNO.map((tipo: TipoServicoExterno) => (
                <option key={tipo} value={tipo}>
                  {TIPO_SERVICO_EXTERNO_LABEL[tipo]}
                </option>
              ))}
            </Select>

            <Select
              id="servico-externo-prestador"
              label="Prestador"
              required
              disabled={semPrestadores}
              error={errors.prestador_id?.message}
              hint={
                semPrestadores ? (
                  <>
                    Nenhum prestador cadastrado.{" "}
                    <Link to="/servicos-externos/prestadores" className="font-medium text-action hover:underline">
                      Cadastre um prestador
                    </Link>
                    .
                  </>
                ) : undefined
              }
              {...register("prestador_id")}
            >
              <option value="" disabled>
                {carregandoPrestadores ? "Carregando..." : "Selecione..."}
              </option>
              {prestadoresDoTipo?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="servico-externo-quantidade"
              label="Quantidade enviada"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              required
              hint={
                producao ? `Disponível: ${formatarQuantidade(producao.quantidade_produzida, "unidade")}` : undefined
              }
              error={errors.quantidade_enviada?.message}
              {...register("quantidade_enviada")}
            />
            <Input
              id="servico-externo-data-envio"
              label="Data de envio"
              type="date"
              required
              error={errors.data_envio?.message}
              {...register("data_envio")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="servico-externo-data-recebimento-prevista"
              label="Recebimento previsto"
              type="date"
              hint="Opcional."
              error={errors.data_recebimento_prevista?.message}
              {...register("data_recebimento_prevista")}
            />
            <Input
              id="servico-externo-valor-cobrado"
              label="Valor cobrado"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              hint="Custo do serviço terceirizado — opcional, pode ser preenchido depois."
              error={errors.valor_cobrado?.message}
              {...register("valor_cobrado")}
            />
          </div>

          <Input
            id="servico-externo-nota-fiscal"
            label="Nota fiscal"
            type="text"
            maxLength={60}
            hint="Opcional."
            error={errors.nota_fiscal?.message}
            {...register("nota_fiscal")}
          />

          <Textarea
            id="servico-externo-observacoes"
            label="Observações"
            maxLength={1000}
            hint="Opcional."
            error={errors.observacoes?.message}
            {...register("observacoes")}
          />

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} loadingText="Registrando..." disabled={semProducoes || semPrestadores}>
            Enviar para serviço externo
          </Button>
        </form>
      </div>
    </div>
  );
}
