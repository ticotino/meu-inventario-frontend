import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RequireAdmin } from "./routes/RequireAdmin";

const AppLayout = lazy(() =>
  import("./components/layout/AppLayout").then((module) => ({ default: module.AppLayout })),
);
const NotFound = lazy(() => import("./pages/NotFound").then((module) => ({ default: module.NotFound })));
const Login = lazy(() => import("./pages/auth/Login").then((module) => ({ default: module.Login })));
const Cadastro = lazy(() =>
  import("./pages/auth/Cadastro").then((module) => ({ default: module.Cadastro })),
);
const Dashboard = lazy(() =>
  import("./pages/dashboard/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const CadastroUsuario = lazy(() =>
  import("./pages/usuarios/CadastroUsuario").then((module) => ({ default: module.CadastroUsuario })),
);
const Fabricantes = lazy(() =>
  import("./pages/fabricantes/Fabricantes").then((module) => ({ default: module.Fabricantes })),
);
const MateriasPrimas = lazy(() =>
  import("./pages/materias-primas/MateriasPrimas").then((module) => ({ default: module.MateriasPrimas })),
);
const NovaMateriaPrima = lazy(() =>
  import("./pages/materias-primas/NovaMateriaPrima").then((module) => ({ default: module.NovaMateriaPrima })),
);
const MateriaPrimaDetalhe = lazy(() =>
  import("./pages/materias-primas/MateriaPrimaDetalhe").then((module) => ({
    default: module.MateriaPrimaDetalhe,
  })),
);
const Producoes = lazy(() =>
  import("./pages/producao/Producoes").then((module) => ({ default: module.Producoes })),
);
const NovaProducao = lazy(() =>
  import("./pages/producao/NovaProducao").then((module) => ({ default: module.NovaProducao })),
);
const ProducaoDetalhe = lazy(() =>
  import("./pages/producao/ProducaoDetalhe").then((module) => ({ default: module.ProducaoDetalhe })),
);
const Produtos = lazy(() =>
  import("./pages/producao/Produtos").then((module) => ({ default: module.Produtos })),
);
const NovoProduto = lazy(() =>
  import("./pages/producao/NovoProduto").then((module) => ({ default: module.NovoProduto })),
);
const ProdutoDetalhe = lazy(() =>
  import("./pages/producao/ProdutoDetalhe").then((module) => ({ default: module.ProdutoDetalhe })),
);
const Pedidos = lazy(() => import("./pages/pedidos/Pedidos").then((module) => ({ default: module.Pedidos })));
const NovoPedido = lazy(() =>
  import("./pages/pedidos/NovoPedido").then((module) => ({ default: module.NovoPedido })),
);
const PedidoDetalhe = lazy(() =>
  import("./pages/pedidos/PedidoDetalhe").then((module) => ({ default: module.PedidoDetalhe })),
);
const Clientes = lazy(() =>
  import("./pages/pedidos/Clientes").then((module) => ({ default: module.Clientes })),
);
const Romaneios = lazy(() =>
  import("./pages/romaneios/Romaneios").then((module) => ({ default: module.Romaneios })),
);
const NovoRomaneio = lazy(() =>
  import("./pages/romaneios/NovoRomaneio").then((module) => ({ default: module.NovoRomaneio })),
);
const RomaneioDetalhe = lazy(() =>
  import("./pages/romaneios/RomaneioDetalhe").then((module) => ({ default: module.RomaneioDetalhe })),
);

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-page text-sm text-muted"
    >
      Carregando página...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/cadastro/:token" element={<Cadastro />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<RequireAdmin />}>
                <Route path="/usuarios/novo" element={<CadastroUsuario />} />
              </Route>

              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/fabricantes" element={<Fabricantes />} />
                <Route path="/materias-primas" element={<MateriasPrimas />} />
                <Route path="/materias-primas/nova" element={<NovaMateriaPrima />} />
                <Route path="/materias-primas/:id" element={<MateriaPrimaDetalhe />} />
                <Route path="/producao" element={<Producoes />} />
                <Route path="/producao/nova" element={<NovaProducao />} />
                <Route path="/producao/produtos" element={<Produtos />} />
                <Route path="/producao/produtos/novo" element={<NovoProduto />} />
                <Route path="/producao/produtos/:id" element={<ProdutoDetalhe />} />
                <Route path="/producao/:id" element={<ProducaoDetalhe />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/pedidos/novo" element={<NovoPedido />} />
                <Route path="/pedidos/clientes" element={<Clientes />} />
                <Route path="/pedidos/:id" element={<PedidoDetalhe />} />
                <Route path="/romaneios" element={<Romaneios />} />
                <Route path="/romaneios/novo" element={<NovoRomaneio />} />
                <Route path="/romaneios/:id" element={<RomaneioDetalhe />} />

              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
