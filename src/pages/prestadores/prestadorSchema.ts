import { z } from "zod";
import { TIPOS_SERVICO_PRESTADOR } from "../../types/prestador";

export const prestadorSchema = z.object({
  nome: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(160, "O nome deve ter no máximo 160 caracteres"),
  contato: z.string().trim().max(120, "O contato é muito longo").optional(),
  telefone: z.string().trim().max(30, "O telefone é muito longo").optional(),
  email: z
    .string()
    .trim()
    .max(254, "O e-mail é muito longo")
    .refine((valor) => valor === "" || z.string().email().safeParse(valor).success, "Informe um e-mail válido")
    .optional(),
  tipos_servico: z.array(z.enum(TIPOS_SERVICO_PRESTADOR)).min(1, "Selecione ao menos um tipo de serviço"),
});

export type PrestadorFormData = z.infer<typeof prestadorSchema>;
