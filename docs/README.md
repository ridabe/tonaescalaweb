# Minha Escala Web - Documentacao

Esta pasta documenta exclusivamente o modulo web do Minha Escala.

O modulo web usa a mesma base Supabase do app Android. Por isso, a especificacao de banco permanece compartilhada e foi mantida nesta pasta.

## Documentos principais

- `PRD_WEB.md`: produto, publico, escopo e criterios de sucesso da versao web.
- `SPEC_WEB.md`: arquitetura, stack, rotas, modulos e integracoes do frontend web.
- `UX_WEB.md`: fluxos de organizador e convidado adaptados para navegador.
- `DESIGN_SYSTEM_WEB.md`: diretrizes visuais e responsivas para a web.
- `TEST_PLAN_WEB.md`: roteiro de validacao funcional antes de deploy.

## Documentos compartilhados com o app

- `MINHA_ESCALA_DATABASE_SPEC.pdf`: especificacao da base de dados compartilhada.
- `API_SPEC.md`: contratos Supabase consumidos pela web e pelo app.
- `RLS_SECURITY_SPEC.md`: regras de seguranca, RLS e isolamento multi-tenant.
- `FLUXO_ESCALAS.md`: regra de negocio de escala por codigo do evento + email.

## Decisoes-base

- A web nao substitui o app Android; ela atende usuarios que nao querem ou nao podem instalar o app.
- O acesso do convidado deve funcionar sem cadastro, usando `invite_code + email`.
- O organizador usa Supabase Auth com email/senha ou Google.
- A web usa somente chave publica/publishable do Supabase.
- Nenhuma chave `service_role` deve existir no frontend, no Vercel ou no bundle.
- A base de dados, RLS, RPCs e tabelas sao compartilhadas com o app.
