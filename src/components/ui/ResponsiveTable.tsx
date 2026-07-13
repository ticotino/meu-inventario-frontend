import type { ReactNode } from "react";

export interface Coluna<T> {
  header: string;
  cell: (item: T) => ReactNode;
  alignRight?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  items: T[];
  columns: Coluna<T>[];
  getRowKey: (item: T) => string;
  mobileCard: (item: T) => ReactNode;
  caption: string;
}

export function ResponsiveTable<T>({ items, columns, getRowKey, mobileCard, caption }: ResponsiveTableProps<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface shadow-card sm:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((coluna) => (
                <th
                  key={coluna.header}
                  scope="col"
                  className={`px-4 py-3 text-xs font-medium text-muted ${coluna.alignRight ? "text-right" : "text-left"}`}
                >
                  {coluna.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={getRowKey(item)} className="border-t border-border transition-colors hover:bg-page motion-reduce:transition-none">
                {columns.map((coluna) => (
                  <td
                    key={coluna.header}
                    className={`px-4 py-3 align-top text-body ${coluna.alignRight ? "text-right" : "text-left"}${coluna.className ? ` ${coluna.className}` : ""}`}
                  >
                    {coluna.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 sm:hidden">
        {items.map((item) => (
          <li key={getRowKey(item)} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            {mobileCard(item)}
          </li>
        ))}
      </ul>
    </>
  );
}
