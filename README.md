# Meu Inventário — Frontend

Frontend web (React + TypeScript + Vite) do Meu Inventário: um app interno para o dono de uma oficina/produção controlar matérias-primas, produção, pedidos e romaneios em um único registro. Veja [PRODUCT.md](PRODUCT.md) (estratégia) e [DESIGN.md](DESIGN.md) (sistema visual) para contexto.

## Trabalho assistido por agentes

Consulte [AGENTS.md](AGENTS.md) antes de delegar alterações. O arquivo registra fontes de verdade, limites de propriedade, requisitos de acessibilidade, validações e o fluxo de publicação deste frontend.

## Pré-requisitos

- Node.js 22+
- O backend rodando localmente (repositório `meu-inventario-backend`), com banco de dados migrado e populado (`npx knex migrate:latest && npx knex seed:run`)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure a URL da API em `.env` (já existe um `.env.example` como referência):

   ```env
   VITE_API_URL=http://localhost:3333/api
   ```

3. Rode o backend em paralelo (em outro terminal, na pasta do backend), garantindo que ele esteja escutando na mesma porta configurada acima.

4. Inicie o frontend:

   ```bash
   npm run dev
   ```

   O app sobe em `http://localhost:5173` (ou na próxima porta livre, se 5173 estiver ocupada).

## Primeiro acesso (login)

O backend cria um usuário administrador padrão ao rodar o seed (`npx knex seed:run` na pasta do backend):

- **E-mail:** `admin@meuinventario.local`
- **Senha:** `admin123`

Use essas credenciais para o primeiro login. Se a tela de login não aceitar nenhuma credencial, o motivo mais comum é o seed do banco não ter sido executado ainda — rode o comando acima na pasta do backend e tente novamente.

**Troque a senha do admin padrão assim que possível** (ou crie um novo admin e desative o padrão), especialmente antes de publicar o projeto.

## Criando novos usuários

Usuários com papel `admin` acessam **Gerenciar acessos** em `/usuarios/novo`. Nessa tela podem criar outro administrador diretamente ou gerar um convite individual de administrador ou funcionário. O convidado abre `/cadastro/:token`, confirma os dados e define a senha; o papel vem do convite armazenado no servidor e não pode ser alterado pelo formulário público.

O login lembra somente nome e e-mail da última conta usada no dispositivo. Senhas e tokens nunca são guardados nesse recurso.

## Recursos principais

- alertas de estoque mínimo para matérias-primas e produtos, com indicadores no dashboard;
- prazos e situação de pedidos, incluindo atrasados, vencendo hoje e próximos;
- histórico filtrável e paginado de movimentações de estoque;
- impressão A4 de pedidos e romaneios com a opção nativa **Salvar como PDF**;
- solicitações de compra derivadas das matérias-primas com estoque baixo, com recebimento auditado;
- relatórios tabulares de consumo, produção e produtos faturados por período.

## Scripts

- `npm run dev` — inicia o servidor de desenvolvimento (Vite)
- `npm run build` — checa tipos (`tsc -b`) e gera o build de produção
- `npm run preview` — serve o build de produção localmente
- `npm run lint` — roda o ESLint em `src/`

## Estrutura

```text
src/
  components/layout/   # Sidebar, Topbar, AppLayout (casca da aplicação autenticada)
  components/ui/        # componentes de UI genéricos (ex.: EmBreve, placeholder de seções futuras)
  contexts/AuthContext   # estado de sessão (usuário logado, login/logout)
  pages/auth/Login       # tela de login
  pages/usuarios/        # gestão de administradores e convites (admin only)
  pages/dashboard/       # dashboard inicial
  routes/                # guards de rota (ProtectedRoute exige login, RequireAdmin exige papel admin)
  services/              # chamadas HTTP (api.ts com interceptors de token/refresh, authService, usuariosService)
  types/                 # tipos compartilhados (ex.: Usuario, Papel)
```

## Autenticação

- O access token fica em memória (`services/tokenStore.ts`); o refresh token é um cookie httpOnly gerenciado pelo backend.
- Ao carregar o app, `AuthContext` tenta restaurar a sessão via `POST /auth/refresh` + `GET /auth/me`.
- Um interceptor do Axios (`services/api.ts`) renova o access token automaticamente em respostas `401` e repete a requisição original.
