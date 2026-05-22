# PRD - Minha Escala Web

## 1. Visao

O Minha Escala Web e a versao acessivel por navegador do Minha Escala. Ela permite que organizadores gerenciem eventos, escalas, repertorio e escalados pelo computador ou celular, e que convidados respondam escalas sem instalar o app Android.

## 2. Problema

Nem todos os usuarios convidados querem baixar um aplicativo. Alguns acessam apenas por link recebido no WhatsApp, email ou QR Code. Organizadores tambem podem preferir montar escalas em tela maior, especialmente quando trabalham com muitos escalados, repertorios e eventos.

## 3. Objetivos

- Permitir entrada do convidado via navegador usando codigo do evento + email.
- Permitir que organizadores usem a mesma conta e dados existentes do app.
- Reutilizar a mesma base Supabase, respeitando RLS e regras de negocio atuais.
- Oferecer uma experiencia web responsiva, mobile-first e funcional em desktop.
- Cobrir os fluxos operacionais essenciais sem depender da instalacao do app.

## 4. Publico

### Organizadores

Lideres, coordenadores e administradores de escalas que criam eventos, adicionam escalados, acompanham respostas e gerenciam repertorio.

### Convidados

Escalados ou participantes que recebem um convite e precisam ver detalhes da escala, aceitar ou recusar com justificativa.

## 5. Escopo MVP Web

### Incluido

- Login do organizador com email/senha e Google.
- Leitura da organizacao existente do usuario.
- Criacao de organizacao quando nao houver nenhuma.
- Listagem e criacao de eventos.
- Detalhe do evento com resumo de status.
- Criacao de equipes e escalados.
- Compartilhamento de codigo, link e QR Code.
- Entrada do convidado por codigo + email.
- Resposta de aceite ou recusa com justificativa.
- Area de ferramentas:
  - dashboard mensal;
  - repertorio;
  - escalados/contatos.
- Busca automatica de musicas no modulo repertorio.

### Fora do escopo inicial

- Afinador web.
- Push notification nativo.
- Funcionalidade offline.
- Administracao avancada de planos e pagamentos.
- Edicao completa de todos os campos ja cadastrados.
- Importacao em massa de escalados.

## 6. Indicadores de sucesso

- Convidado responde escala sem instalar app.
- Organizador acessa web com a mesma conta do app e ve seus eventos.
- Evento criado na web aparece no app e vice-versa.
- Escala criada na web pode ser respondida pelo convidado.
- Repertorio e escalados cadastrados na web ficam disponiveis para uso compartilhado.

## 7. Riscos

- Diferencas entre regras implementadas no app e na web.
- RLS bloqueando recursos por grants ou policies incompletas.
- APIs externas de musica/letra com CORS, indisponibilidade ou retorno incompleto.
- Experiencia mobile web ficar densa demais se copiar padroes de desktop.

## 8. Dependencias

- Supabase Auth.
- Supabase Data API e RPCs existentes.
- Vercel para deploy.
- iTunes Search API para busca de musicas.
- lyrics.ovh para tentativa de importacao de letra.
