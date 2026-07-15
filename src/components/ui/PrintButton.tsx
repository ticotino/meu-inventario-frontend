import { Button } from "./Button";

interface PrintButtonProps {
  label?: string;
}

export function PrintButton({ label = "Imprimir ou salvar PDF" }: PrintButtonProps) {
  return (
    <Button variant="secondary" className="min-h-11" data-print-hidden onClick={() => window.print()}>
      {label}
    </Button>
  );
}
