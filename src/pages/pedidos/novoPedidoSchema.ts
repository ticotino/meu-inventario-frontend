import { z } from "zod";
import { TIPOS_SERVICO_EXTERNO } from "../../types/servicoExterno";

// "" representa "nenhum destino selecionado" no <select> — mesma convenção
// usada em novoServicoExternoSchema.ts para campos obrigatórios condicionais.
const itemPedidoSchema = z
  .object({
    produto_id: z.string().min(1, "Selecione o produto"),
    quantidade: z
      .string()
      .min(1, "Informe a quantidade")
      .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero"),
    precisa_servico_externo: z.boolean(),
    destino_servico_externo: z.enum(["", ...TIPOS_SERVICO_EXTERNO]).optional(),
    instrucao: z.string().trim().max(500, "A instrução é muito longa").optional(),
    imagem_referencia_url: z.string().trim().max(2048, "A URL é muito longa").optional(),
  })
  .superRefine((item, ctx) => {
    // A instrução é aceita e validada (limite de 500 caracteres, acima) sempre,
    // independentemente de "precisa_servico_externo" — ela descreve a peça em
    // si, não só o acabamento. Já o destino continua exigido apenas quando o
    // acabamento é marcado, pois é o único dado que direciona o item a um
    // prestador específico; a imagem de referência continua opcional mesmo
    // com acabamento marcado.
    if (item.precisa_servico_externo && !item.destino_servico_externo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecione o destino do acabamento",
        path: ["destino_servico_externo"],
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
