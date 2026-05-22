# Fluxo de Escalas - Web e App

## 1. Regra central

A escala e montada pelo organizador antes do convidado responder.

O convidado acessa sua escala com:

```text
codigo do evento + email cadastrado na escala
```

O codigo localiza o evento. O email identifica a pessoa escalada dentro daquele evento.

## 2. Admin

1. Faz login.
2. Seleciona ou carrega sua organizacao.
3. Cria evento.
4. Cria equipes, se necessario.
5. Adiciona escalados com:
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
3. Informa email cadastrado na escala.
4. Sistema valida se existe escala daquele email no evento.
5. Se existir, mostra dados da escala.
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
- lista basica dos demais escalados.

Nao pode ver:

- telefone de outros convidados;
- email de outros convidados;
- dados de eventos onde nao esta escalado.

## 6. Historico por email

Depois de validar um codigo + email valido, o convidado pode alternar entre eventos ativos em que o mesmo email esta escalado.

## 7. Notificacoes

Obrigatorio:

- registrar aceite;
- registrar recusa com motivo;
- gerar notificacao administrativa para o organizador.

Opcional:

- notificacao por visualizacao.
