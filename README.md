# ToNaEscala Web

Versao web do ToNaEscala, adaptada do app Android/Expo para acesso pelo navegador.

## Stack

- React + Vite + TypeScript
- Supabase Auth, Data API e RPCs existentes
- Lucide React para iconografia
- CSS responsivo mobile-first

## Configuracao

Crie um arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Use sempre a chave publica/publishable no frontend. Nunca use `service_role` na web.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Fluxos implementados

- Entrada do organizador por email/senha e Google.
- Criacao da primeira organizacao.
- Listagem e criacao de eventos.
- Detalhe do evento com resumo de status dos escalados.
- Criacao de equipes e escalas.
- Compartilhamento por codigo/link e QR Code.
- Entrada do convidado por codigo do evento + email cadastrado na escala.
- Aceite ou recusa com justificativa obrigatoria.
- Notificacoes administrativas de aceite/recusa.
