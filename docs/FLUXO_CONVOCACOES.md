# Fluxo de Convocacoes - Web e App

## 1. Regra central

A escala e montada pelo organizador antes do convidado responder.

O convidado acessa sua convocacao com:

```text
codigo do evento + email convocado
```

O codigo localiza o evento. O email identifica a pessoa convocada dentro daquele evento.

## 2. Admin

1. Faz login.
2. Seleciona ou carrega sua organizacao.
3. Cria evento.
4. Cria equipes, se necessario.
5. Adiciona convocados com:
   - nome;
   - email;
   - telefone opcional;
   - equipe;
   - funcao;
   - horario;
   - observacoes.
6. Compartilha codigo/link/QR Code.
7. Acompanha status.

## 3. Convidado

1. Recebe codigo ou link.
2. Acessa web ou app.
3. Informa email convocado.
4. Sistema valida se existe convocacao daquele email no evento.
5. Se existir, mostra dados da convocacao.
6. Se nao existir, bloqueia acesso aos detalhes.
7. Convidado aceita ou recusa.
8. Recusa exige justificativa.

## 4. Status

Visualizacao:

- `not_viewed`;
- `viewed`.

Resposta:

- `pending`;
- `accepted`;
- `declined`.

Campos:

- `viewed_at`;
- `responded_at`;
- `decline_reason`.

## 5. Dados visiveis ao convidado

Pode ver:

- dados do evento;
- sua equipe e funcao;
- horarios;
- observacoes;
- lista basica dos demais convocados.

Nao pode ver:

- telefone de outros convidados;
- email de outros convidados;
- dados de eventos onde nao esta convocado.

## 6. Historico por email

Depois de validar um codigo + email valido, o convidado pode alternar entre eventos ativos em que o mesmo email esta convocado.

## 7. Notificacoes

Obrigatorio:

- registrar aceite;
- registrar recusa com motivo;
- gerar notificacao administrativa para o organizador.

Opcional:

- notificacao por visualizacao.
