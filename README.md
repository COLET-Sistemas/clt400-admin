# clt400-admin

Painel administrativo para cadastro de tenants (empresas) do ecossistema CLT400. Fase 1 da migração multi-tenant.

## O que faz

- Cadastra empresas definindo `name`, `host`, `port`, `protocol`.
- Gera automaticamente `id`, `subdomain`, `setup_code` e `api_token`.
- Mostra `setup_code` e `api_token` uma única vez no modal pós-criação.
- Permite rotacionar `setup_code` (uso em caso de demissão de técnico) — invalida sessões ativas bumping `session_version`.
- Permite ativar/desativar/excluir tenants.

## Stack

- Next.js 16 (App Router) + React 19
- Drizzle ORM + Neon Postgres
- Tailwind 4
- Auth: login único via env vars, cookie httpOnly assinado com HMAC

## Setup

1. **Criar banco Neon (grátis)**
   - https://neon.tech → criar conta → criar projeto `clt400-tenants`.
   - Copiar connection string (com `?sslmode=require`).

2. **Instalar deps**
   ```bash
   cd C:\ColetFrontend\clt400-admin
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   cp .env.local.example .env.local
   ```
   Editar `.env.local`:
   - `DATABASE_URL` — cole a string do Neon.
   - `ADMIN_USER` / `ADMIN_PASSWORD` — credenciais do painel.
   - `ADMIN_SESSION_SECRET` — gere 32 bytes:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

4. **Criar schema no banco**
   - Via Drizzle Kit (recomendado):
     ```bash
     npm run db:push
     ```
   - Ou rodar o SQL direto:
     ```bash
     psql $DATABASE_URL -f drizzle/0000_init.sql
     ```

5. **Rodar em dev**
   ```bash
   npm run dev
   ```
   Abrir http://localhost:3000 → redireciona para `/login`.

## Comandos úteis

| Comando | Ação |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar produção |
| `npm run db:generate` | Gerar migration a partir do schema |
| `npm run db:push` | Aplicar schema direto no banco (dev) |
| `npm run db:migrate` | Aplicar migrations versionadas |
| `npm run db:studio` | Drizzle Studio (GUI) |

## Estrutura

```
app/
  login/                  # form de login
  tenants/                # lista, detalhes, novo, editar
  api/
    auth/                 # login/logout
    tenants/              # CRUD + rotate-setup-code
lib/
  db.ts, schema.ts        # Drizzle + Neon
  tenants.ts              # queries
  auth.ts                 # cookie HMAC + validação login
  crypto.ts               # gerar setup_code, api_token, slug
components/               # UI compartilhada
middleware.ts             # protege rotas privadas
drizzle/                  # migrations SQL
```

## Fluxo completo

1. Admin loga no painel.
2. Cria tenant informando nome + host/port/protocol.
3. Copia `setup_code` + `api_token` do modal (única vez).
4. Envia `api_token` para o técnico instalar no `.env` da API local.
5. Envia `setup_code` para o técnico usar em `empresa1.colet.com.br/setup` (Fase 2).

## Segurança

- Cookie de sessão `HttpOnly`, `Secure` em produção, `SameSite=Strict`, assinado HMAC-SHA256.
- Segredos gerados via `crypto.randomBytes` (não PRNG).
- Comparações de senha/token em tempo constante (`timingSafeEqual`).
- `setup_code` e `api_token` nunca logados nem devolvidos em listagens após criação.

## Fora do escopo (Fase 2)

- Integração no frontend clt400tt2 (`middleware.ts`, `/setup`, proxy reescrito).
- Automação de DNS/domínio no Vercel.
- Auditoria de rotações.
- Multi-admin.
