import { useEffect, useRef } from "react";

interface ResultsAnnouncerProps {
  count: number;
  /** Substantivo no singular (ex.: "pedido"). */
  singular: string;
  /** Substantivo no plural (ex.: "pedidos"). */
  plural: string;
  emptyMessage?: string;
  /** Gênero do substantivo, para concordância de "encontrado(a)". */
  genero?: "m" | "f";
  /** Enquanto true, nada é anunciado (dados ainda carregando). */
  loading?: boolean;
}

export function ResultsAnnouncer({
  count,
  singular,
  plural,
  emptyMessage = "Nenhum resultado encontrado",
  genero = "m",
  loading = false,
}: ResultsAnnouncerProps) {
  const regiaoRef = useRef<HTMLParagraphElement>(null);
  const primeiroResultado = useRef(true);

  useEffect(() => {
    if (loading) return;
    // O primeiro resultado (carga inicial da página) não é anunciado;
    // só mudanças posteriores de busca/filtro interessam ao leitor de tela.
    if (primeiroResultado.current) {
      primeiroResultado.current = false;
      return;
    }
    let mensagem: string;
    if (count === 0) {
      mensagem = emptyMessage;
    } else {
      const sufixo = genero === "f" ? "a" : "o";
      mensagem =
        count === 1
          ? `1 ${singular} encontrad${sufixo}`
          : `${count} ${plural} encontrad${sufixo}s`;
    }
    // A região viva é atualizada direto no DOM (sistema externo): o <p> não
    // tem filhos gerenciados pelo React, então o texto não é sobrescrito.
    if (regiaoRef.current) {
      regiaoRef.current.textContent = mensagem;
    }
  }, [count, loading, singular, plural, emptyMessage, genero]);

  return <p ref={regiaoRef} className="sr-only" aria-live="polite" />;
}
