# RLS SECURITY SPEC - Minha Escala Web

## 1. Objetivo

Definir as regras de seguranca para a versao web usando a mesma base Supabase do app Android.

## 2. Principios

- RLS habilitada em tabelas do schema publico.
- Grants minimos para `anon` e `authenticated`.
- Nenhuma chave `service_role` no frontend web ou no Vercel.
- Dados de autorizacao nao devem depender de `user_metadata`.
- Funcoes sensiveis devem validar acesso no banco.
- Fluxo de convidado nao pode abrir dados apenas com codigo do evento.

## 3. Atores

| Ator | Auth | Role Supabase | Acesso |
|---|---|---|---|
| Organizador | Supabase Auth | `authenticated` | Organizacoes em que e membro ativo. |
| Convidado | Codigo + email | `anon` ou `authenticated` | Apenas escalas vinculadas ao email validado. |
| Sistema | Backend/Edge Function | `service_role` | Operacoes internas, nunca no frontend. |

## 4. Organizacoes

Autorizacao operacional deve usar `organization_members` quando disponivel.

Helpers recomendados:

```sql
app_private.is_org_member(org_id uuid)
app_private.has_org_role(org_id uuid, allowed_roles text[])
app_private.can_admin_org(org_id uuid)
```

Regra:

- leitura: membro ativo;
- escrita operacional: `owner`, `admin` ou `editor`;
- billing/membros sensiveis: `owner` ou RPC server-side.

## 5. Eventos e equipes

Tabelas:

- `events`;
- `teams`.

Regras:

- Organizadores so acessam eventos/equipes das organizacoes em que possuem permissao.
- Convites devem ser gerados por RPC.
- Leitura publica direta de `events` deve ser limitada; preferir RPCs que retornam apenas o necessario.

## 6. Escalas

Tabela:

- `event_assignments`.

Organizador:

- pode criar/listar escalas de eventos da organizacao que administra.

Convidado:

- nao faz SELECT amplo direto;
- acessa por RPC validando `invite_code + email`;
- pode responder apenas suas proprias escalas.

RPCs sensiveis:

- `get_guest_events_by_invite_email`;
- `get_assignments_by_guest_event_email`;
- `get_assignment_roster_by_guest_event_email`;
- `respond_guest_event_assignment`.

## 7. Repertorio

Tabela:

- `songs`.

Regras:

- musicas de sistema podem ter `org_id is null`;
- musicas da organizacao devem respeitar acesso por organizacao;
- escrita deve ser restrita a usuarios autenticados com permissao na organizacao.

## 8. Escalados

Tabela:

- `org_contacts`.

RPCs:

- `list_org_contacts`;
- `search_org_contacts`;
- `upsert_org_contact`;
- `delete_org_contact`.

Regras:

- contatos sao dados da organizacao;
- leitura/escrita apenas para membros autorizados;
- email e telefone nao devem ser expostos para convidados.

## 9. Dashboard

O dashboard le:

- `events`;
- `event_assignments`.

Regras:

- agregar apenas dados de organizacoes acessiveis ao usuario logado;
- nao expor metricas entre tenants.

## 10. Checklist

- [ ] `service_role` ausente do bundle e do Vercel frontend.
- [ ] RLS ativa nas tabelas publicas.
- [ ] Convidado validado por `invite_code + email`.
- [ ] Email fora da escala retorna erro sem revelar detalhes.
- [ ] Usuario da organizacao A nao le dados da organizacao B.
- [ ] Repertorio e contatos respeitam `organization_id`/`org_id`.
- [ ] RPCs `security definer` possuem validacao interna de acesso.
