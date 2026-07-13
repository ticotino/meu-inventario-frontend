import { useEffect } from "react";

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = `${pageTitle} | Meu Inventário`;
  }, [pageTitle]);
}
