import { z } from "zod";
import { TIPOS_BENEFICIAMENTO } from "../../types/beneficiamento";
import { temNoMaximoTresCasas } from "./beneficiamentoValidacao";

export const novoBeneficiamentoSchema = z.object({
  producao_id: z.string().min(1, "Selecione uma produção"),
  prestador_id: z.string().min(1, "Selecione um prestador"),
  tipo: z.enum(TIPOS_BENEFICIAMENTO, { message: "Selecione o tipo de beneficiamento" }),
  quantidade_enviada: z
    .string()
    .min(1, "Informe a quantidade")
    .refine((valor) => Number(valor) > 0, "A quantidade deve ser maior que zero")
    .refine((valor) => temNoMaximoTresCasas(Number(valor)), "Use no máximo 3 casas decimais"),
  data_envio: z.string().min(1, "Informe a data de envio"),
  data_recebimento_prevista: z.string().optional(),
  valor_cobrado: z
    .string()
    .refine((valor) => valor === "" || Number(valor) >= 0, "O valor não pode ser negativo")
    .optional(),
  nota_fiscal: z.string().trim().max(60, "A nota fiscal é muito longa").optional(),
  observacoes: z.string().trim().max(1000, "As observações são muito longas").optional(),
});

export type NovoBeneficiamentoForm = z.infer<typeof novoBeneficiamentoSchema>;
