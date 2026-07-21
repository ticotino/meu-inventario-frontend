import { z } from "zod";
import { TIPOS_BENEFICIAMENTO } from "../../types/beneficiamento";

// "" representa "nenhum destino selecionado" no <select> — mesma convenção
// usada em novoBeneficiamentoSchema.ts para campos obrigatórios condicionais.
const itemPedidoSchema = z
  .object({
    produto_id: z.string().min(1, "Selecione o produto"),
    quantidade: z
      .string()
      .min(1, "Informe a quantidade")
      .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
    precisa_beneficiamento: z.boolean(),
    destino_beneficiamento: z.enum(["", ...TIPOS_BENEFICIAMENTO]).optional(),
    instrucao: z.string().trim().max(500, "A instrução é muito longa").optional(),
    imagem_referencia_url: z.string().trim().max(2048, "A URL é muito longa").optional(),
  })
  .superRefine((item, ctx) => {
    // Instrução e imagem continuam opcionais mesmo com acabamento marcado —
    // só o destino é exigido, pois é o único dado que direciona o item a um
    // prestador específico.
    if (item.precisa_beneficiamento && !item.destino_beneficiamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione o destino do acabamento",
        path: ["destino_beneficiamento"],
      });
    }
  });

export const novoPedidoSchema = z
  .object({
    cliente_id: z.string().min(1, "Selecione um cliente"),
    data_pedido: z.string().min(1, "Informe a data do pedido"),
    data_prevista_entrega: z.string().min(1, "Informe o prazo de entrega"),
    observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
    itens: z.array(itemPedidoSchema).min(1, "Informe ao menos um produto"),
  })
  .refine((dados) => dados.data_prevista_entrega >= dados.data_pedido, {
    message: "O prazo não pode ser anterior à data do pedido",
    path: ["data_prevista_entrega"],
  });

export type NovoPedidoForm = z.infer<typeof novoPedidoSchema>;
