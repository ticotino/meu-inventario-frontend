# Meu Inventário — Frontend

Frontend web (React + TypeScript + Vite) do Meu Inventário: um app interno para o dono de uma oficina/produção controlar matérias-primas, produção, pedidos e romaneios em um único registro. Veja [PRODUCT.md](PRODUCT.md) (estratégia) e [DESIGN.md](DESIGN.md) (sistema visual) para contexto.

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

Usuários com papel `admin` têm acesso ao item **"Novo usuário"** na barra lateral (`/usuarios/novo`), onde é possível cadastrar novos administradores ou funcionários informando nome, e-mail, senha e papel. Essa tela chama o endpoint `POST /usuarios` do backend, que exige um token de administrador — por isso não existe cadastro público/self-service, apenas um admin já autenticado pode criar outros usuários.

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
  pages/usuarios/        # cadastro de novos usuários (admin only)
  pages/dashboard/       # dashboard inicial
  routes/                # guards de rota (ProtectedRoute exige login, RequireAdmin exige papel admin)
  services/              # chamadas HTTP (api.ts com interceptors de token/refresh, authService, usuariosService)
  types/                 # tipos compartilhados (ex.: Usuario, Papel)
```

## Autenticação

- O access token fica em memória (`services/tokenStore.ts`); o refresh token é um cookie httpOnly gerenciado pelo backend.
- Ao carregar o app, `AuthContext` tenta restaurar a sessão via `POST /auth/refresh` + `GET /auth/me`.
- Um interceptor do Axios (`services/api.ts`) renova o access token automaticamente em respostas `401` e repete a requisição original.
