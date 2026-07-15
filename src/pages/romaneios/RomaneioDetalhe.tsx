import { Link, useParams } from "react-router-dom";
import { ErrorState } from "../../components/ui/ErrorState";
import { PageHeader } from "../../components/ui/PageHeader";
import { PrintButton } from "../../components/ui/PrintButton";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useRomaneio } from "../../hooks/useRomaneios";
import { getApiErrorMessage } from "../../services/api";
import type { RomaneioItem } from "../../types/romaneio";
import { formatarData, formatarQuantidade } from "../../utils/format";

function ResumoItem({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd
        className={
          destaque ? "mt-0.5 text-2xl font-semibold tabular-nums text-ink" : "mt-0.5 text-sm text-body"
        }
      >
        {valor}
      </dd>
    </div>
  );
}

function DetalheSkeleton() {
  return (
    <div role="status" aria-label="Carregando..." className="space-y-6">
      <div className="animate-pulse space-y-2 motion-reduce:animate-none">
        <div className="h-7 w-48 rounded bg-border" />
        <div className="h-4 w-72 rounded bg-border/60" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <div className="animate-pulse space-y-3 motion-reduce:animate-none">
            <div className="h-4 w-1/4 rounded bg-border" />
            <div className="h-9 rounded bg-border/60" />
            <div className="h-9 rounded bg-border/60" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

// Expande as linhas agrupadas ("2 caixas de 30") na lista numerada de caixas
// do item, na ordem em que foram registradas.
function expandirCaixas(item: RomaneioItem): string[] {
  const caixas: string[] = [];
  for (const linha of item.caixas) {
    for (let i = 0; i < linha.quantidade_caixas; i++) {
      caixas.push(formatarQuantidade(linha.quantidade_por_caixa, "unidade"));
    }
  }
  return caixas;
}

function ItemRomaneio({ item, inicioNumeracao }: { item: RomaneioItem; inicioNumeracao: number }) {
  const caixas = expandirCaixas(item);
  return (
    <div className="print-item rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">
          <span className="tabular-nums">{item.codigo}</span> · {item.nome}
        </h3>
        <p className="text-sm tabular-nums text-body">
          {caixas.length} {caixas.length === 1 ? "caixa" : "caixas"}
        </p>
      </div>
      {item.descricao && <p className="mt-1 text-sm text-muted">{item.descricao}</p>}
      <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm text-body sm:grid-cols-2 lg:grid-cols-3">
        {caixas.map((quantidade, i) => (
          <li key={i} className="flex justify-between gap-4 border-b border-border/60 py-1 tabular-nums">
            <span className="text-muted">Caixa {inicioNumeracao + i}</span>
            <span>{quantidade}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RomaneioDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { data: romaneio, isPending, isError, error, refetch } = useRomaneio(id);
  useDocumentTitle(romaneio ? romaneio.codigo : "Romaneio");

  if (isPending) {
    return <DetalheSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <ErrorState
          mensagem={getApiErrorMessage(error, "Não foi possível carregar o romaneio.")}
          onRetry={() => void refetch()}
        />
        <Link to="/romaneios" className="inline-block text-sm font-medium text-action hover:underline">
          Voltar aos romaneios
        </Link>
      </div>
    );
  }

  // Numeração global de caixas atravessando os itens (Caixa 1..N do documento).
  const itensNumerados = romaneio.itens.reduce<Array<{ item: RomaneioItem; inicio: number }>>((acc, item) => {
    const anterior = acc.at(-1);
    const inicio = anterior
      ? anterior.inicio + anterior.item.caixas.reduce((total, linha) => total + linha.quantidade_caixas, 0)
      : 1;
    acc.push({ item, inicio });
    return acc;
  }, []);

  return (
    <div className="space-y-6" data-print-document>
      <PageHeader
        titulo={romaneio.codigo}
        descricao={`Expedição do pedido ${romaneio.pedido_codigo} em ${formatarData(romaneio.data_saida)}`}
        action={
          <div className="flex flex-wrap items-center gap-3" data-print-hidden>
            <PrintButton />
            <Link to="/romaneios" className="text-sm font-medium text-action hover:underline">
              Voltar aos romaneios
            </Link>
          </div>
        }
      />

      <div className="print-section rounded-lg border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-medium text-ink">Resumo</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResumoItem rotulo="Volumes" valor={romaneio.volumes_total} destaque />
          <ResumoItem
            rotulo="Pedido"
            valor={
              <Link to={`/pedidos/${romaneio.pedido_id}`} className="font-medium text-action hover:underline">
                {romaneio.pedido_codigo}
              </Link>
            }
          />
          <ResumoItem rotulo="Cliente" valor={romaneio.cliente_nome} />
          <ResumoItem rotulo="Data de saída" valor={formatarData(romaneio.data_saida)} />
          <ResumoItem rotulo="Registrado por" valor={romaneio.usuario_nome} />
        </dl>
        <p className="mt-4 text-xs text-muted">
          Romaneios são documentos permanentes e não podem ser editados.
        </p>
      </div>

      <div className="print-section space-y-3">
        <h2 className="text-sm font-medium text-ink">Itens e caixas</h2>
        {itensNumerados.map(({ item, inicio }) => (
          <ItemRomaneio key={item.produto_id} item={item} inicioNumeracao={inicio} />
        ))}
      </div>
    </div>
  );
}
