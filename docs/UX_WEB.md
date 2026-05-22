# UX - ToNaEscala Web

## 1. Principios

- A web deve abrir rapido e funcionar bem em celular.
- A primeira tela deve permitir duas entradas claras: organizador e convidado.
- Fluxos administrativos podem aproveitar melhor telas maiores.
- O convidado nunca deve precisar criar senha.
- Status devem usar cor e texto, nunca apenas cor.

## 2. Entrada

### Organizador

1. Acessa a URL web.
2. Informa email/senha ou usa Google.
3. Sistema carrega organizacoes.
4. Se existir organizacao, entra em Eventos.
5. Se nao existir, pede criacao da organizacao.

### Convidado

1. Recebe link ou codigo.
2. Acessa a web.
3. Informa codigo do evento e email cadastrado na escala.
4. Sistema valida por RPC.
5. Se encontrar escala, abre area do convidado.
6. Se nao encontrar, mostra erro claro.

Mensagem recomendada:

```text
Este email nao esta na escala deste evento.
Confira o email ou fale com o organizador.
```

## 3. Navegacao do organizador

Menu principal:

- Agenda.
- Eventos.
- Ferramentas.
- Notificacoes.
- Perfil.

Em desktop, o menu fica lateral. Em mobile, vira barra inferior.

## 4. Eventos

### Lista

Cada card deve mostrar:

- titulo;
- data e horario;
- local, quando houver;
- total de escalados;
- aceites e recusas.

### Criacao

Campos:

- nome;
- categoria;
- local;
- inicio;
- fim;
- cor;
- descricao.

Ao salvar, gerar convite automaticamente.

## 5. Detalhe do evento

Deve mostrar:

- titulo, data, horario e local;
- botao de compartilhar convite;
- resumo de aceitos, recusas, vistos e nao vistos;
- lista de escalados;
- formulario para adicionar escalado.

## 6. Convite

Deve apresentar:

- QR Code;
- codigo `TNE-XXXXXX`;
- link web;
- instrucao de uso: codigo + email cadastrado na escala.

## 7. Area do convidado

Deve mostrar:

- evento;
- organizacao;
- data e horario;
- local;
- escalas daquele email;
- equipe;
- funcao;
- horario de chegada;
- observacoes;
- equipe escalada visivel.

Acoes:

- Aceito participar.
- Nao poderei.

Recusa exige justificativa.

## 8. Ferramentas

### Repertorio

Fluxo:

1. Abrir Ferramentas > Repertorio.
2. Buscar musica existente na biblioteca.
3. Adicionar musica.
4. Opcionalmente buscar musica automaticamente.
5. Selecionar resultado.
6. Sistema preenche titulo, artista, letra quando disponivel e link do Cifras Club.
7. Usuario revisa e salva.

### Escalados

Fluxo:

1. Abrir Ferramentas > Escalados.
2. Buscar por nome, email, telefone ou funcao.
3. Adicionar escalado.
4. Salvar nome, funcao padrao, email e telefone.

### Dashboard

Mostra:

- taxa de resposta;
- eventos do mes;
- escalados;
- aceites;
- pendentes;
- detalhes por evento.

## 9. Estados vazios

- Sem eventos: sugerir criar evento.
- Sem repertorio: sugerir adicionar musica.
- Sem escalados: sugerir adicionar escalado.
- Sem dados no dashboard: explicar que os indicadores aparecem depois de criar eventos e escalas.

## 10. Erros

Mensagens devem ser objetivas:

- `Nao foi possivel carregar os eventos.`
- `Nao foi possivel salvar a escala.`
- `Musica importada, mas a letra nao foi encontrada automaticamente.`
- `Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local.`
