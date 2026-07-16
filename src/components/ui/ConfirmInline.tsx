import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { buttonClasses } from "./formStyles";
import type { ButtonVariant } from "./formStyles";

interface ConfirmInlineProps {
  /** Conteúdo do botão que inicia a confirmação (ex.: "Desativar"). */
  triggerLabel: ReactNode;
  triggerAriaLabel?: string;
  triggerVariant?: ButtonVariant;
  /** Pergunta exibida e anunciada ao abrir (ex.: "Desativar?"). */
  question: string;
  confirmLabel?: string;
  confirmAriaLabel?: string;
  cancelLabel?: string;
  cancelAriaLabel?: string;
  /** Estiliza o botão de confirmação como destrutivo. */
  danger?: boolean;
  /** Desabilita o gatilho e os botões de confirmação (ex.: outra mutação em andamento). */
  disabled?: boolean;
  /** Estado de carregamento enquanto a mutação de confirmação roda. */
  loading?: boolean;
  loadingText?: string;
  /**
   * Após confirmar, devolve o foco ao gatilho se ele continuar montado.
   * Passe false quando a confirmação remove o elemento da tela e o chamador
   * cuida do foco (ex.: linha excluída da tabela).
   */
  restoreFocusOnConfirm?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmInline({
  triggerLabel,
  triggerAriaLabel,
  triggerVariant = "secondary",
  question,
  confirmLabel = "Sim",
  confirmAriaLabel,
  cancelLabel = "Não",
  cancelAriaLabel,
  danger = false,
  disabled = false,
  loading = false,
  loadingText = "...",
  restoreFocusOnConfirm = true,
  onConfirm,
  onCancel,
}: ConfirmInlineProps) {
  const [aberto, setAberto] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deveFocarGatilho = useRef(false);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // Ao abrir, o foco vai para o "Não" (e não para o "Sim"): evita que um
  // Enter/Espaço repetido no mesmo lugar do gatilho confirme a ação por engano.
  useEffect(() => {
    if (aberto) {
      cancelRef.current?.focus();
    } else if (deveFocarGatilho.current) {
      deveFocarGatilho.current = false;
      triggerRef.current?.focus();
    }
  }, [aberto]);

  function fechar(restaurarFoco: boolean) {
    deveFocarGatilho.current = restaurarFoco;
    setAberto(false);
  }

  function cancelar() {
    onCancel?.();
    fechar(true);
  }

  async function confirmar() {
    try {
      await onConfirm();
    } finally {
      // Fecha mesmo em caso de erro: o chamador exibe a mensagem em um
      // banner próprio e o gatilho fica disponível para nova tentativa.
      if (montado.current) {
        fechar(restoreFocusOnConfirm);
      }
    }
  }

  function aoTeclar(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Escape" && aberto && !loading) {
      event.stopPropagation();
      cancelar();
    }
  }

  return (
    <span
      role="group"
      className="inline-flex flex-wrap items-center gap-1 text-sm text-body"
      onKeyDown={aoTeclar}
    >
      {/* Região viva montada desde o primeiro render: só assim a pergunta é
          anunciada de forma confiável quando o texto é inserido. */}
      <span aria-live="assertive">{aberto ? question : null}</span>
      {aberto ? (
        <>
          <button
            type="button"
            className={`${buttonClasses(danger ? "danger" : "secondary")} px-2 py-1`}
            onClick={() => void confirmar()}
            disabled={disabled || loading}
            aria-label={confirmAriaLabel}
          >
            {loading ? loadingText : confirmLabel}
          </button>
          <button
            ref={cancelRef}
            type="button"
            className={`${buttonClasses("secondary")} px-2 py-1`}
            onClick={cancelar}
            disabled={disabled || loading}
            aria-label={cancelAriaLabel}
          >
            {cancelLabel}
          </button>
        </>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className={buttonClasses(triggerVariant)}
          onClick={() => setAberto(true)}
          disabled={disabled}
          aria-label={triggerAriaLabel}
        >
          {triggerLabel}
        </button>
      )}
    </span>
  );
}
