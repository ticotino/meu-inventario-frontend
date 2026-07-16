import { useEffect, useRef } from "react";
import { feedbackErrorClass } from "./formStyles";

interface FormErrorBannerProps {
  message?: string | null;
}

export function FormErrorBanner({ message }: FormErrorBannerProps) {
  const bannerRef = useRef<HTMLParagraphElement>(null);
  const mensagemAnterior = useRef<string | null | undefined>(null);

  useEffect(() => {
    const acabouDeAparecer = Boolean(message) && !mensagemAnterior.current;
    mensagemAnterior.current = message;
    if (acabouDeAparecer && bannerRef.current) {
      bannerRef.current.focus();
      // scrollIntoView pode não existir em ambientes de teste (jsdom)
      bannerRef.current.scrollIntoView?.({ block: "nearest" });
    }
  }, [message]);

  if (!message) return null;

  return (
    <p
      ref={bannerRef}
      role="alert"
      tabIndex={-1}
      className={`${feedbackErrorClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2`}
    >
      {message}
    </p>
  );
}
