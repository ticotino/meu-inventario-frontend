import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { FormErrorBanner } from "../../components/ui/FormErrorBanner";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { ResponsiveTable } from "../../components/ui/ResponsiveTable";
import type { Coluna } from "../../components/ui/ResponsiveTable";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import { Textarea } from "../../components/ui/Textarea";
import { useMateriaPrima, useUpdateMateriaPrima } from "../../hooks/useMateriasPrimas";
import { useMovimentacoesEstoque } from "../../hooks/useMovimentacoesEstoque";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getApiErrorMessage } from "../../services/api";
import type { MateriaPrima } from "../../types/materiaPrima";
import { UNIDADE_MEDIDA_LABELS } from "../../types/materiaPrima";
import type { MovimentacaoEstoque } from "../../types/movimentacaoEstoque";
import { formatarData, formatarDataHora, formatarMoeda, formatarQuantidade } from "../../utils/format";

const editarSchema = z.object({
  nome_tecido: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres")
    .max(120, "O nome deve ter no máximo 120 caracteres"),
  cor: z.string().trim().max(60, "A cor é muito longa").optional(),
  observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
  estoque_minimo: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) >= 0, "O estoque mínimo não pode ser negativo"),
  largura_rolo_m: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) > 0, "A largura do rolo deve ser maior que zero"),
  ativo: z.boolean(),
});

type EditarForm = z.infer<typeof editarSchema>;

function ResumoItem({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className={destaque ? "mt-0.5 text-2xl font-semibold tabular-nums text-ink" : "mt-0.5 text-sm text-body"}>
        {valor}
      </dd>
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div role="status" aria-label="Carregando..." className="space-y-6">
      <div className="animate-pulse space-y-2 motion-reduce:animate-none">
        <div className="h-7 w-48 rounded bg-border" />
        <div className="h-4 w-72 rounded bg-border/60" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="animate-pulse space-y-3 motion-reduce:animate-none">
            <div className="h-4 w-1/4 rounded bg-border" />
            <div className="h-9 rounded bg-border/60" />
            <div className="h-9 rounded bg-border/60" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

function FormEdicao({ materiaPrima }: { materiaPrima: MateriaPrima }) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const atualizar = useUpdateMateriaPrima();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarForm>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      nome_tecido: materiaPrima.nome_tecido,
      cor: materiaPrima.cor ?? "",
      observacoes: materiaPrima.observacoes ?? "",
      estoque_minimo: materiaPrima.estoque_minimo ?? "",
      largura_rolo_m: materiaPrima.largura_rolo_cm ? String(Number(materiaPrima.largura_rolo_cm) / 100) : "",
      ativo: materiaPrima.ativo,
    },
  });

  useEffect(() => {
    reset({
      nome_tecido: materiaPrima.nome_tecido,
      cor: materiaPrima.cor ?? "",
      observacoes: materiaPrima.observacoes ?? "",
      estoque_minimo: materiaPrima.estoque_minimo ?? "",
      largura_rolo_m: materiaPrima.largura_rolo_cm ? String(Number(materiaPrima.largura_rolo_cm) / 100) : "",
      ativo: materiaPrima.ativo,
    });
  }, [materiaPrima, reset]);

  async function onSubmit(dados: EditarForm) {
    setErro(null);
    setSucesso(null);
    try {
      await atualizar.mutateAsync({
        id: materiaPrima.id,
        input: {
          nome_tecido: dados.nome_tecido,
          // "" significa "limpar o campo" em um form de edição.
          cor: dados.cor || null,
          observacoes: dados.observacoes || null,
          estoque_minimo: dados.estoque_minimo ? Number(dados.estoque_minimo) : null,
          largura_rolo_cm: dados.largura_rolo_m ? Number(dados.largura_rolo_m) * 100 : null,
          ativo: dados.ativo,
        },
      });
      setSucesso("Alterações salvas.");
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível salvar as alterações."));
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-medium text-ink">Editar</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate aria-busy={isSubmitting}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="detalhe-nome-tecido"
            label="Nome do tecido"
            type="text"
            required
            maxLength={120}
            error={errors.nome_tecido?.message}
            {...register("nome_tecido")}
          />
          <Input id="detalhe-cor" label="Cor" type="text" maxLength={60} error={errors.cor?.message} {...register("cor")} />
        </div>
        <Textarea
          id="detalhe-observacoes"
          label="Observações"
          maxLength={1000}
          error={errors.observacoes?.message}
          {...register("observacoes")}
        />

        <Input
          id="detalhe-estoque-minimo"
          label="Estoque mínimo"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          hint="Deixe vazio para desativar o alerta de estoque baixo."
          error={errors.estoque_minimo?.message}
          {...register("estoque_minimo")}
        />

        <Input
          id="detalhe-largura-rolo"
          label="Largura do rolo (m)"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          hint="Opcional. Usada para sugerir o consumo de tecido na produção."
          error={errors.largura_rolo_m?.message}
          {...register("largura_rolo_m")}
        />

        <label className="flex min-h-11 items-center gap-2 text-sm text-body">
          <input type="checkbox" className="h-4 w-4 accent-action" {...register("ativo")} />
          Ativa (desmarque para tirar do estoque em uso)
        </label>

        <FormErrorBanner message={erro} />
        {sucesso && <SuccessBanner>{sucesso}</SuccessBanner>}

        <Button type="submit" loading={isSubmitting} loadingText="Salvando...">
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}

// Histórico de recebimentos de reposição desta matéria-prima — reaproveita
// as movimentações de estoque do tipo `entrada_compra` (já existentes) em
// vez de criar uma lista nova do zero. Mostra nota fiscal e valor de cada
// remessa, permitindo abandonar a planilha paralela usada hoje para isso
// (ver design.md/tasks.md, Fase 4).
function HistoricoRecebimentos({ materiaPrimaId }: { materiaPrimaId: string }) {
  const { data, isPending, isError, error, refetch } = useMovimentacoesEstoque({
    itemTipo: "materia_prima",
    itemId: materiaPrimaId,
    tipo: "entrada_compra",
  });

  const colunas: Coluna<MovimentacaoEstoque>[] = [
    { header: "Recebido em", cell: (movimento) => formatarDataHora(movimento.criado_em) },
    {
      header: "Quantidade",
      alignRight: true,
      cell: (movimento) => (
        <span className="tabular-nums">
          {formatarQuantidade(movimento.quantidade, movimento.item_unidade_medida)}
        </span>
      ),
    },
    { header: "Nota fiscal", cell: (movimento) => movimento.nota_fiscal ?? "—" },
    { header: "Valor", cell: (movimento) => formatarMoeda(movimento.valor_unitario) },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="text-sm font-medium text-ink">Histórico de recebimentos</h2>

      <div className="mt-4">
        {isPending ? (
          <TableSkeleton linhas={2} />
        ) : isError ? (
          <ErrorState
            mensagem={getApiErrorMessage(error, "Não foi possível carregar o histórico de recebimentos.")}
            onRetry={() => void refetch()}
          />
        ) : data.itens.length === 0 ? (
          <EmptyState
            titulo="Nenhuma reposição recebida ainda"
            descricao="Quando uma remessa deste tecido for recebida na tela de Compras, ela aparece aqui com nota fiscal e valor."
          />
        ) : (
          <ResponsiveTable
            items={data.itens}
            columns={colunas}
            getRowKey={(movimento) => movimento.id}
            caption="Histórico de recebimentos desta matéria-prima"
            mobileCard={(movimento) => (
              <div className="space-y-1">
                <p className="font-medium text-ink tabular-nums">{formatarDataHora(movimento.criado_em)}</p>
                <p className="text-sm text-body tabular-nums">
                  {formatarQuantidade(movimento.quantidade, movimento.item_unidade_medida)}
                </p>
                <p className="text-sm text-body">Nota fiscal: {movimento.nota_fiscal ?? "—"}</p>
                <p className="text-sm text-body">Valor: {formatarMoeda(movimento.valor_unitario)}</p>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

export function MateriaPrimaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: materiaPrima, isPending, isError, error, refetch } = useMateriaPrima(id);
  useDocumentTitle(materiaPrima ? materiaPrima.codigo : "Matéria-prima");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar a matéria-prima.")}
          onRetry={() => void refetch()}
        />
        <Link to="/materias-primas" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar à lista de matérias-primas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={materiaPrima.codigo}
        descricao={`${materiaPrima.nome_tecido}${materiaPrima.cor ? ` (${materiaPrima.cor})` : ""} — ${materiaPrima.fabricante_nome}${materiaPrima.ativo ? "" : " · Inativa"}`}
        action={
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/movimentacoes?item_tipo=materia_prima&item_id=${materiaPrima.id}`}
              className="text-sm font-medium text-action hover:underline"
            >
              Ver movimentações
            </Link>
            <Link to="/materias-primas" className="text-sm font-medium text-action hover:underline">
              Voltar à lista
            </Link>
          </div>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Resumo do recebimento</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResumoItem
            rotulo="Saldo disponível"
            valor={formatarQuantidade(materiaPrima.quantidade_disponivel, materiaPrima.unidade_medida)}
            destaque
          />
          <ResumoItem
            rotulo="Quantidade recebida"
            valor={formatarQuantidade(materiaPrima.quantidade_recebida, materiaPrima.unidade_medida)}
          />
          <ResumoItem
            rotulo="Estoque mínimo"
            valor={
              materiaPrima.estoque_minimo === null
                ? "Alerta desativado"
                : formatarQuantidade(materiaPrima.estoque_minimo, materiaPrima.unidade_medida)
            }
          />
          <ResumoItem rotulo="Valor unitário" valor={formatarMoeda(materiaPrima.valor_unitario)} />
          <ResumoItem rotulo="Recebido em" valor={formatarData(materiaPrima.data_recebimento)} />
          <ResumoItem rotulo="Fabricante" valor={materiaPrima.fabricante_nome} />
          <ResumoItem rotulo="Unidade" valor={UNIDADE_MEDIDA_LABELS[materiaPrima.unidade_medida]} />
          <ResumoItem
            rotulo="Largura do rolo"
            valor={
              materiaPrima.largura_rolo_cm
                ? formatarQuantidade(Number(materiaPrima.largura_rolo_cm) / 100, "metro")
                : "—"
            }
          />
        </dl>
        {materiaPrima.estoque_baixo && (
          <p role="status" className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm font-medium text-danger-strong">
            Estoque baixo: o saldo disponível atingiu o limite configurado.
          </p>
        )}
        {materiaPrima.observacoes && <p className="mt-4 text-sm text-body">{materiaPrima.observacoes}</p>}
      </div>

      <HistoricoRecebimentos materiaPrimaId={materiaPrima.id} />

      <FormEdicao materiaPrima={materiaPrima} />
    </div>
  );
}
