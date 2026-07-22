import type { UnidadeMedida } from "../types/materiaPrima";

const quantidadeFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
// Metragem de tecido sempre com pelo menos 2 casas decimais fixas (ex.: "30,00"
// em vez de "30"), consistente com o jeito que o dono da oficina fala/escreve
// metragem no dia a dia — ver design.md, decisão 6. Outras unidades (kg,
// unidade, rolo) continuam sem mínimo de casas.
const metragemFormatter = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const moedaFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const UNIDADE_SUFIXOS: Record<UnidadeMedida, { singular: string; plural: string }> = {
  metro: { singular: "m", plural: "m" },
  kg: { singular: "kg", plural: "kg" },
  unidade: { singular: "unidade", plural: "unidades" },
  rolo: { singular: "rolo", plural: "rolos" },
};

export function formatarQuantidade(valor: string | number, unidade: UnidadeMedida): string {
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (Number.isNaN(numero)) return "—";
  const sufixo = numero === 1 ? UNIDADE_SUFIXOS[unidade].singular : UNIDADE_SUFIXOS[unidade].plural;
  const formatter = unidade === "metro" ? metragemFormatter : quantidadeFormatter;
  return `${formatter.format(numero)} ${sufixo}`;
}

export function formatarMoeda(valor: string | number | null): string {
  if (valor === null || valor === "") return "—";
  const numero = typeof valor === "number" ? valor : Number(valor);
  if (Number.isNaN(numero)) return "—";
  return moedaFormatter.format(numero);
}

// Para colunas DATE puras (data_producao, data_recebimento) — o backend
// devolve "AAAA-MM-DD" sem componente de hora, sem depender de timezone.
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return "—";
  return `${dia}/${mes}/${ano}`;
}

// Para colunas TIMESTAMPTZ (criado_em) — converte para a data local do
// navegador em vez de recortar os 10 primeiros caracteres do ISO em UTC
// (que erra o dia para quem está em fuso negativo à noite).
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  return data.toLocaleDateString("pt-BR");
}
