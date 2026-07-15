import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { SuccessBanner } from "../../components/ui/SuccessBanner";
import { Textarea } from "../../components/ui/Textarea";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useProduto, useUpdateProduto } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";
import type { Produto } from "../../types/produto";
import { formatarDataHora, formatarQuantidade } from "../../utils/format";

const editarSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(120, "O nome deve ter no máximo 120 caracteres"),
  descricao: z.string().trim().max(1000, "A descrição é muito longa").optional(),
  estoque_minimo: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) >= 0, "O estoque mínimo não pode ser negativo"),
  ativo: z.boolean(),
});

type EditarForm = z.infer<typeof editarSchema>;

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

function FormEdicao({ produto }: { produto: Produto }) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const atualizar = useUpdateProduto();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarForm>({
    resolver: zodResolver(editarSchema),
    defaultValues: {
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      estoque_minimo: produto.estoque_minimo ?? "",
      ativo: produto.ativo,
    },
  });

  useEffect(() => {
    reset({
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      estoque_minimo: produto.estoque_minimo ?? "",
      ativo: produto.ativo,
    });
  }, [produto, reset]);

  async function onSubmit(dados: EditarForm) {
    setErro(null);
    setSucesso(null);
    try {
      await atualizar.mutateAsync({
        id: produto.id,
        input: {
          nome: dados.nome,
          // "" significa "limpar o campo" em um form de edição.
          descricao: dados.descricao || null,
          estoque_minimo: dados.estoque_minimo ? Number(dados.estoque_minimo) : null,
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
        <Input
          id="detalhe-produto-nome"
          label="Nome"
          type="text"
          required
          maxLength={120}
          error={errors.nome?.message}
          {...register("nome")}
        />
        <Textarea
          id="detalhe-produto-descricao"
          label="Descrição"
          maxLength={1000}
          error={errors.descricao?.message}
          {...register("descricao")}
        />

        <Input
          id="detalhe-produto-estoque-minimo"
          label="Estoque mínimo"
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          hint="Deixe vazio para desativar o alerta de estoque baixo."
          error={errors.estoque_minimo?.message}
          {...register("estoque_minimo")}
        />

        <label className="flex min-h-11 items-center gap-2 text-sm text-body">
          <input type="checkbox" className="h-4 w-4 accent-action" {...register("ativo")} />
          Ativo (desmarque para tirar do catálogo em uso)
        </label>

        {erro && (
          <p role="alert" className={feedbackErrorClass}>
            {erro}
          </p>
        )}
        {sucesso && <SuccessBanner>{sucesso}</SuccessBanner>}

        <Button type="submit" loading={isSubmitting} loadingText="Salvando...">
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}

export function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: produto, isPending, isError, error, refetch } = useProduto(id);
  useDocumentTitle(produto ? produto.codigo : "Produto");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar o produto.")}
          onRetry={() => void refetch()}
        />
        <Link to="/producao/produtos" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar à lista de produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={produto.codigo}
        descricao={`${produto.nome}${produto.ativo ? "" : " · Inativo"}`}
        action={
          <Link to="/producao/produtos" className="text-sm font-medium text-action hover:underline">
            Voltar à lista
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Estoque</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Saldo disponível</dt>
            <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-ink">
              {formatarQuantidade(produto.quantidade_disponivel, "unidade")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Criado em</dt>
            <dd className="mt-0.5 text-sm text-body">{formatarDataHora(produto.criado_em)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Estoque mínimo</dt>
            <dd className="mt-0.5 text-sm text-body">
              {produto.estoque_minimo === null
                ? "Alerta desativado"
                : formatarQuantidade(produto.estoque_minimo, "unidade")}
            </dd>
          </div>
        </dl>
        {produto.estoque_baixo && (
          <p role="status" className="mt-4 rounded-md bg-danger-bg px-3 py-2 text-sm font-medium text-danger-strong">
            Estoque baixo: o saldo disponível atingiu o limite configurado.
          </p>
        )}
        <p className="mt-4 text-xs text-muted">
          O saldo muda apenas ao registrar produções (entrada) e romaneios (saída) — não é editável diretamente.
        </p>
        {produto.descricao && <p className="mt-2 text-sm text-body">{produto.descricao}</p>}
      </div>

      <FormEdicao produto={produto} />
    </div>
  );
}
