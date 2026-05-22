---
name: "tonaescala-consultor"
description: "Consulta e sintetiza arquitetura, pastas, módulos, regras de negócio e design do ToNaEscala Web. Invoque ao analisar o sistema, planejar features ou validar fluxos/UX."
---

# ToNaEscala Consultor (Contexto do Sistema)

## Objetivo

Garantir que qualquer resposta sobre este projeto use o contexto real do repositório (código + docs), descrevendo com precisão:

- Estrutura de pastas e responsabilidades.
- Módulos/fluxos do produto (organizador e convidado).
- Regras de negócio (escala, convites, respostas, multi-tenant).
- Regras de segurança (RLS, Supabase, ausência de service_role no frontend).
- Regras e diretrizes de UX/design (mobile-first, componentes e tokens).

## Quando invocar (gatilhos)

Invoque este skill sempre que o usuário pedir, direta ou indiretamente:

- “Analise o projeto / explique o sistema / como funciona”.
- “Onde fica X no código? Qual módulo cuida disso?”.
- “Adicionar/alterar funcionalidade”, “corrigir bug de fluxo”, “mudar UX”.
- “Regras de negócio”, “permissões”, “RLS”, “Supabase Auth/RPC”.
- “Padrões de design”, “design system”, “responsividade”, “componentes”.

## Fontes primárias (ordem recomendada)

Antes de responder, consultar pelo menos:

- Produto e escopo: [docs/PRD_WEB.md](file:///c:/Projetos/ToNaEscalaWeb/docs/PRD_WEB.md)
- Arquitetura/rotas/módulos: [docs/SPEC_WEB.md](file:///c:/Projetos/ToNaEscalaWeb/docs/SPEC_WEB.md)
- UX e fluxos: [docs/UX_WEB.md](file:///c:/Projetos/ToNaEscalaWeb/docs/UX_WEB.md)
- Diretrizes de UI: [docs/DESIGN_SYSTEM_WEB.md](file:///c:/Projetos/ToNaEscalaWeb/docs/DESIGN_SYSTEM_WEB.md)
- Regras de escala: [docs/FLUXO_ESCALAS.md](file:///c:/Projetos/ToNaEscalaWeb/docs/FLUXO_ESCALAS.md)
- Segurança/RLS: [docs/RLS_SECURITY_SPEC.md](file:///c:/Projetos/ToNaEscalaWeb/docs/RLS_SECURITY_SPEC.md)
- Contratos/integrações: [docs/API_SPEC.md](file:///c:/Projetos/ToNaEscalaWeb/docs/API_SPEC.md)

E no código:

- Rotas e decisões de sessão/org: [src/main.tsx](file:///c:/Projetos/ToNaEscalaWeb/src/main.tsx)
- Integração Supabase: [src/lib/supabase.ts](file:///c:/Projetos/ToNaEscalaWeb/src/lib/supabase.ts)
- Camada de API (PostgREST + RPC): [src/lib/api.ts](file:///c:/Projetos/ToNaEscalaWeb/src/lib/api.ts)
- Componentes base de UI: [src/components](file:///c:/Projetos/ToNaEscalaWeb/src/components)
- Páginas/feature modules: [src/pages](file:///c:/Projetos/ToNaEscalaWeb/src/pages)
- Tokens/tema: [src/theme/tokens.ts](file:///c:/Projetos/ToNaEscalaWeb/src/theme/tokens.ts)

## Mapa de módulos (como classificar a resposta)

Ao explicar uma feature, sempre enquadrar em:

- **Autenticação (Organizador)**: login email/senha e Google OAuth; callback; sessão; roteamento protegido.
- **Organização**: criação inicial e seleção (quando aplicável).
- **Eventos**: listagem, criação, detalhe do evento.
- **Escalas (Assignments)**: criação/listagem para organizador; status; resposta do convidado.
- **Convites**: geração de invite_code via RPC; compartilhamento por link/QR.
- **Convidado**: entrada por invite_code + email; lista de eventos; roster; aceitar/recusar com motivo.
- **Notificações**: notificações administrativas (quando presentes).
- **Ferramentas**: repertório/músicas, contatos/escalados, dashboard mensal.
- **Integrações externas**: busca de música/letra e links (quando presentes).

## Regras de negócio (checklist)

Antes de propor alteração, validar explicitamente:

- Convidado entra por **invite_code + email**; armazenamento local é conveniência, não autorização.
- Resposta **declined** exige justificativa.
- Acesso é multi-tenant por organização; não misturar dados entre organizações.
- Operações sensíveis preferem RPC (principalmente fluxo de convidado e convites).
- Dados de segurança dependem de RLS/políticas no Supabase; frontend nunca deve contornar isso.

## Regras de design/UX (checklist)

Antes de sugerir UI:

- Mobile-first, responsivo, estados de loading/erro claros.
- Reutilizar componentes existentes em [src/components](file:///c:/Projetos/ToNaEscalaWeb/src/components).
- Respeitar tokens/tema e padrões do design system documentado.
- Manter linguagem PT-BR e textos consistentes com as telas existentes.

## Como responder (formato)

Em respostas analíticas, entregar:

1) **Resumo do domínio** (o “porquê” e “para quem”).
2) **Mapa de pastas/módulos** com responsabilidades.
3) **Fluxo do usuário** (organizador vs convidado), destacando regras.
4) **Integrações e segurança** (Supabase, RLS, RPCs, env vars).
5) **Referências com links** para arquivos e trechos (sempre que citar comportamento).

## Restrições importantes

- Não inventar tabelas/RPCs/rotas: se não estiver em docs/código, dizer que não encontrou e apontar o que foi consultado.
- Nunca sugerir uso de `service_role` no frontend ou exposição de credenciais.
