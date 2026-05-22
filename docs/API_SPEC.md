# API SPEC - ToNaEscala Web

## 1. Objetivo

Definir os contratos consumidos pela versao web usando a mesma base Supabase do app Android.

A web usa:

- Supabase Auth para organizadores.
- Data API/PostgREST para CRUD simples.
- RPCs PostgreSQL para operacoes sensiveis.
- APIs externas apenas no modulo de repertorio.

## 2. Principios

- O frontend web nunca usa `service_role`.
- Todas as tabelas sensiveis dependem de RLS.
- Fluxos de convidado devem ser mediados por RPC.
- `organization_id` e `organization_members` definem isolamento.
- A web deve ser compativel com dados criados pelo app Android.

## 3. Autenticacao

### Organizador

- Supabase Auth.
- Provedores: email/senha e Google.
- Role: `authenticated`.
- Identidade: `auth.uid()`.

### Convidado

- Sem conta obrigatoria.
- Entrada por `invite_code + email`.
- Sessao local no navegador apenas para conveniencia:
  - `tne_guest_invite_code`;
  - `tne_guest_email`.
- A autorizacao real acontece nas RPCs.

## 4. Recursos

### Organizations

Tabela: `organizations`

Uso web:

- listar organizacoes do usuario logado;
- criar primeira organizacao quando nao houver nenhuma;
- exibir nome no menu/perfil.

### Events

Tabela: `events`

Uso web:

- listar eventos;
- criar evento;
- abrir detalhe;
- gerar convite;
- exibir dados basicos para organizador.

RPC:

- `generate_event_invite(p_event_id uuid)`.

### Teams

Tabela: `teams`

Uso web:

- listar equipes da organizacao;
- criar equipe durante cadastro de convocado.

### Event Assignments

Tabela: `event_assignments`

Unidade principal da escala por convocacao.

Uso web:

- criar convocado;
- listar convocados do evento;
- calcular status;
- permitir resposta do convidado.

RPCs:

- `create_event_assignment`;
- `get_event_assignments_for_organizer`;
- `get_guest_events_by_invite_email`;
- `get_assignments_by_guest_event_email`;
- `get_assignment_roster_by_guest_event_email`;
- `respond_guest_event_assignment`.

### Admin Notifications

RPCs:

- `get_admin_notifications`;
- `mark_admin_notification_read`.

Uso web:

- listar notificacoes de aceite/recusa.

### Songs

Tabela: `songs`

Uso web:

- listar repertorio;
- criar musica;
- salvar letra, cifra, tons, links e observacoes.

Integracoes externas:

- iTunes Search API: busca de musicas;
- lyrics.ovh: tentativa de importacao de letra;
- Cifras Club: URL derivada por artista/titulo.

### Org Contacts

Tabela: `org_contacts`

RPCs:

- `list_org_contacts`;
- `search_org_contacts`;
- `upsert_org_contact`;
- `delete_org_contact`.

Uso web:

- listar voluntarios;
- cadastrar voluntario;
- sugerir dados para escala em evolucoes futuras.

## 5. Erros esperados

| Codigo/mensagem | Uso |
|---|---|
| `UNAUTHENTICATED` | Organizador nao autenticado. |
| `FORBIDDEN` | Usuario sem acesso a organizacao/evento. |
| `NOT_FOUND` | Codigo/evento nao encontrado. |
| `NOT_INVITED` | Email nao convocado para o evento. |
| `VALIDATION_ERROR` | Payload invalido ou recusa sem justificativa. |

## 6. Contratos principais

### Criar evento

```json
{
  "organization_id": "uuid",
  "title": "Culto de Domingo",
  "category": "Culto",
  "location": "Templo principal",
  "description": "Escala do culto da noite",
  "start_date": "2026-06-07T18:00:00-03:00",
  "end_date": "2026-06-07T20:00:00-03:00",
  "color": "#0F766E"
}
```

### Criar convocacao

RPC: `create_event_assignment`

```json
{
  "p_event_id": "uuid",
  "p_team_id": "uuid | null",
  "p_invitee_name": "Ana Silva",
  "p_invitee_email": "ana@email.com",
  "p_invitee_phone": "+55 11 99999-9999",
  "p_role": "Soprano",
  "p_arrival_time": "2026-06-07T17:00:00-03:00",
  "p_start_time": "2026-06-07T17:00:00-03:00",
  "p_end_time": "2026-06-07T20:00:00-03:00",
  "p_notes": "Chegar para passagem de som."
}
```

### Entrar como convidado

RPC: `get_guest_events_by_invite_email`

```json
{
  "p_invite_code": "TNE-9X4KQ2",
  "p_email": "ana@email.com"
}
```

### Responder convocacao

RPC: `respond_guest_event_assignment`

```json
{
  "p_invite_code": "TNE-9X4KQ2",
  "p_email": "ana@email.com",
  "p_assignment_id": "uuid",
  "p_response": "accepted | declined",
  "p_decline_reason": "Obrigatorio quando declined"
}
```

## 7. Observacoes

- Alguns documentos antigos do app citavam `participants`, `schedules` e `confirmations`; esses recursos podem continuar existindo na base, mas a web atual opera principalmente com `event_assignments`.
- Realtime ainda nao e requisito obrigatorio da web.
- Push notification nativo nao faz parte do MVP web.
