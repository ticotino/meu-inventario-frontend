import { Button } from "./Button";
import { feedbackErrorClass } from "./formStyles";

interface ErrorStateProps {
  mensagem: string;
  onRetry?: () => void;
}

export function ErrorState({ mensagem, onRetry }: ErrorStateProps) {
  return (
    <div className="space-y-3">
      <p role="alert" className={feedbackErrorClass}>
        {mensagem}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
