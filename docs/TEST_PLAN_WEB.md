# Plano de Testes - ToNaEscala Web

## 1. Build

Executar:

```bash
npm run lint
npm run build
```

Critério:

- Ambos devem passar sem erro.

## 2. Configuracao

Validar no ambiente local e Vercel:

- `VITE_SUPABASE_URL`.
- `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `vercel.json` usando `outputDirectory: dist`.

## 3. Login do organizador

Casos:

- Login com usuario existente do app.
- Login com Google.
- Google deve voltar para `/auth/callback` e depois ir para `/app/eventos`.
- Usuario com organizacao existente deve ir para eventos.
- Usuario sem organizacao deve ir para criacao.

Regressao importante:

- Nao redirecionar para criacao de organizacao enquanto a busca de organizacoes ainda esta carregando.

## 4. Eventos

Casos:

- Listar eventos existentes do app.
- Criar evento na web.
- Confirmar que evento aparece no app.
- Abrir detalhe.
- Gerar/copiar codigo e link.
- Ver QR Code.

## 5. Escalados

Casos:

- Adicionar escalado com nome e email.
- Adicionar equipe nova no formulario.
- Ver status inicial pendente.
- Validar resumo de aceitos/recusas/vistos/nao vistos.

## 6. Convidado

Casos:

- Entrar com codigo + email cadastrado na escala.
- Bloquear codigo valido com email fora da escala.
- Aceitar escala.
- Recusar exigindo justificativa.
- Confirmar que status muda no detalhe do evento do organizador.

## 7. Ferramentas

### Repertorio

- Listar musicas existentes.
- Buscar na biblioteca.
- Adicionar musica manualmente.
- Buscar musica automaticamente.
- Selecionar resultado.
- Validar preenchimento de titulo, artista, link do Cifras Club e letra quando disponivel.

### Escalados

- Listar contatos existentes.
- Buscar por nome/email/telefone/funcao.
- Adicionar escalado.
- Confirmar persistencia no Supabase.

### Dashboard

- Ver indicadores do mes.
- Validar eventos sem escalados.
- Validar eventos com pendentes, aceitos e recusas.

## 8. Responsividade

Testar larguras:

- 390px mobile.
- 768px tablet.
- 1280px desktop.

Critérios:

- Menu mobile nao sobrepoe conteudo.
- Textos nao estouram botoes ou cards.
- Formularios permanecem utilizaveis.

## 9. Seguranca

- Confirmar que bundle nao contem `service_role`.
- Confirmar que convidado nao acessa evento apenas com codigo.
- Confirmar que todas as respostas passam por RPC.
- Confirmar RLS entre duas organizacoes diferentes.
