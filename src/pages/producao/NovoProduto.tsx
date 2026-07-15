import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Textarea } from "../../components/ui/Textarea";
import { feedbackErrorClass } from "../../components/ui/formStyles";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useCreateProduto } from "../../hooks/useProdutos";
import { getApiErrorMessage } from "../../services/api";

const novoProdutoSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(120, "O nome deve ter no máximo 120 caracteres"),
  descricao: z.string().trim().max(1000, "A descrição é muito longa").optional(),
  estoque_minimo: z
    .string()
    .optional()
    .refine((valor) => !valor || Number(valor) >= 0, "O estoque mínimo não pode ser negativo"),
});

type NovoProdutoForm = z.infer<typeof novoProdutoSchema>;

export function NovoProduto() {
  useDocumentTitle("Novo produto");
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCreateProduto();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NovoProdutoForm>({ resolver: zodResolver(novoProdutoSchema) });

  async function onSubmit(dados: NovoProdutoForm) {
    setErro(null);
    try {
      const criado = await criar.mutateAsync({
        nome: dados.nome,
        descricao: dados.descricao || undefined,
        estoque_minimo: dados.estoque_minimo ? Number(dados.estoque_minimo) : undefined,
      });
      navigate(`/producao/produtos/${criado.id}`);
    } catch (error) {
      setErro(getApiErrorMessage(error, "Não foi possível cadastrar o produto."));
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Novo produto"
        descricao="Cadastre uma peça acabada. O código PROD- é gerado automaticamente e o estoque começa em zero — ele muda ao registrar produções."
        action={
          <Link to="/producao/produtos" className="text-sm font-medium text-action hover:underline">
            Voltar à lista
          </Link>
        }
      />

      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-5 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate aria-busy={isSubmitting}>
          <Input
            id="produto-nome"
            label="Nome"
            type="text"
            required
            maxLength={120}
            error={errors.nome?.message}
            {...register("nome")}
          />

          <Textarea
            id="produto-descricao"
            label="Descrição"
            maxLength={1000}
            hint="Opcional."
            error={errors.descricao?.message}
            {...register("descricao")}
          />

          <Input
            id="produto-estoque-minimo"
            label="Estoque mínimo"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            hint="Opcional. O produto será sinalizado quando o saldo for igual ou inferior a este valor."
            error={errors.estoque_minimo?.message}
            {...register("estoque_minimo")}
          />

          {erro && (
            <p role="alert" className={feedbackErrorClass}>
              {erro}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} loadingText="Cadastrando...">
            Cadastrar produto
          </Button>
        </form>
      </div>
    </div>
  );
}
