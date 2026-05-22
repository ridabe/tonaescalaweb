# SPEC - ToNaEscala Web

## 1. Stack

- React.
- Vite.
- TypeScript.
- React Router.
- Supabase JS.
- Lucide React.
- qrcode.react.
- Deploy Vercel.

## 2. Estrutura

```text
src/
  components/
  lib/
  pages/
  theme/
  main.tsx
  styles.css
```

## 3. Configuracao de ambiente

Variaveis obrigatorias no Vercel e no `.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Regras:

- Usar apenas chave publica/publishable.
- Nunca expor `service_role`.
- Se as variaveis nao existirem, a tela de entrada deve informar a configuracao ausente.

## 4. Rotas

### Publicas

| Rota | Uso |
|---|---|
| `/` | Login do organizador e entrada do convidado. |
| `/guest` | Area do convidado apos validar codigo + email. |

### Protegidas

| Rota | Uso |
|---|---|
| `/setup` | Criacao da primeira organizacao. |
| `/app/agenda` | Agenda consolidada da organizacao. |
| `/app/eventos` | Listagem de eventos. |
| `/app/eventos/novo` | Criacao de evento. |
| `/app/eventos/:id` | Detalhe, convite e escalados do evento. |
| `/app/ferramentas` | Hub de ferramentas. |
| `/app/ferramentas/repertorio` | Biblioteca musical. |
| `/app/ferramentas/escalados` | Agenda de escalados/contatos. |
| `/app/ferramentas/dashboard` | Indicadores mensais. |
| `/app/notificacoes` | Notificacoes administrativas. |
| `/app/perfil` | Dados basicos da organizacao. |

## 5. Autenticacao

O organizador usa Supabase Auth:

- email/senha;
- Google OAuth.

Apos login:

1. O frontend busca organizacoes via `organizations`.
2. Enquanto carrega, exibe estado de loading.
3. Se houver organizacao, entra no sistema.
4. Se nao houver, direciona para `/setup`.

Importante: nao redirecionar para `/setup` antes de concluir a busca de organizacoes.

## 6. Modulos

### Eventos

Funcoes:

- listar eventos da organizacao;
- criar evento;
- gerar convite via RPC;
- abrir detalhe do evento;
- listar escalados;
- adicionar escala.

### Escalas

Fonte principal:

- `event_assignments`.

RPCs principais:

- `create_event_assignment`;
- `get_event_assignments_for_organizer`;
- `get_guest_events_by_invite_email`;
- `get_assignments_by_guest_event_email`;
- `get_assignment_roster_by_guest_event_email`;
- `respond_guest_event_assignment`.

### Convidado

Sessao local no navegador:

- `tne_guest_invite_code`;
- `tne_guest_email`.

Esses dados apenas identificam o fluxo do convidado no cliente. A autorizacao real deve continuar sendo validada por RPC no Supabase.

### Ferramentas

Inclui:

- Repertorio.
- Escalados.
- Dashboard.

Exclui:

- Afinador.

### Repertorio

Tabelas:

- `songs`.

Integracoes externas:

- iTunes Search API: busca de titulo/artista.
- lyrics.ovh: tentativa de importacao de letra.
- Cifras Club: link montado por slug de artista/titulo.

### Escalados

Tabela/RPC:

- `org_contacts`;
- `list_org_contacts`;
- `upsert_org_contact`.

### Dashboard

Calcula indicadores do mes atual a partir de:

- `events`;
- `event_assignments`.

Indicadores:

- eventos no mes;
- total de escalados;
- aceites;
- recusas;
- pendentes;
- taxa de resposta.

## 7. Deploy

Arquivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 8. Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 9. Regras de compatibilidade com app

- Eventos criados na web devem aparecer no app.
- Escalados criados na web devem seguir o mesmo fluxo de resposta do app.
- Repertorio e contatos usam as mesmas tabelas do app.
- Mudancas de schema devem ser feitas no projeto compartilhado de banco, nao apenas no frontend web.
