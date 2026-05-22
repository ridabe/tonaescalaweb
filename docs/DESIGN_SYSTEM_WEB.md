# Design System - ToNaEscala Web

## 1. Direcao

A interface web deve preservar a identidade acolhedora e organizada do ToNaEscala, adaptada para navegador.

Palavras-chave:

- simples;
- confiavel;
- operacional;
- responsivo;
- leve.

## 2. Paleta

| Token | Cor | Uso |
|---|---|---|
| `brand.primary` | `#0F766E` | Acoes principais e selecao. |
| `brand.primaryPressed` | `#115E59` | Hover/ativo. |
| `brand.primarySoft` | `#CCFBF1` | Destaques suaves. |
| `brand.accent` | `#F59E0B` | Convites e acoes secundarias fortes. |
| `status.success` | `#16A34A` | Aceito/sucesso. |
| `status.warning` | `#F59E0B` | Pendente/atencao. |
| `status.danger` | `#DC2626` | Recusa/erro. |
| `status.info` | `#0284C7` | Informacao. |
| `neutral.background` | `#F8FAFC` | Fundo geral. |
| `neutral.surface` | `#FFFFFF` | Cards e formularios. |
| `neutral.border` | `#E2E8F0` | Bordas. |
| `neutral.text` | `#0F172A` | Texto principal. |
| `neutral.textMuted` | `#64748B` | Texto secundario. |

## 3. Tipografia

Fonte:

- sistema operacional / Inter quando disponivel.

Regras:

- Titulos de pagina: 28px.
- Titulos de card: 18px.
- Corpo: 15px a 16px.
- Labels: 13px, peso 700.
- Badges: 11px, peso 800.

## 4. Layout

### Desktop

- Menu lateral fixo.
- Conteudo com largura maxima.
- Cards em grid quando houver espaco.
- Formularios podem usar 2 ou 3 colunas.

### Mobile

- Menu inferior.
- Conteudo em coluna unica.
- Formularios em coluna unica.
- Areas clicaveis com no minimo 44px de altura.

## 5. Componentes

### Botao

- Altura minima: 48px.
- Raio: 8px.
- Usar icone quando a acao tiver equivalente visual claro.

Tipos:

- Primario.
- Secundario.
- Acento.
- Perigo.
- Ghost.

### Cards

- Raio: 8px.
- Borda: `neutral.border`.
- Sem sombras pesadas.
- Nao colocar cards dentro de cards.

### Inputs

- Altura minima: 48px.
- Raio: 8px.
- Borda focada em `brand.primary`.
- Labels sempre visiveis.

### Badges

| Status | Fundo | Texto |
|---|---|---|
| Pendente | `#FEF3C7` | `#D97706` |
| Aceito | `#DCFCE7` | `#16A34A` |
| Recusado | `#FEE2E2` | `#DC2626` |

## 6. Logo

O logo horizontal atual possui fundo claro na imagem. Na entrada web, aplicar tratamento visual para integrar ao banner, evitando parecer um card solto.

Regra implementada:

```css
mix-blend-mode: multiply;
```

## 7. Iconografia

Usar `lucide-react`.

Icones principais:

- Agenda: `CalendarDays`.
- Eventos: `CalendarPlus`.
- Ferramentas: `Wrench`.
- Repertorio: `Music`.
- Escalados: `BookUser`.
- Dashboard: `BarChart3`.
- Notificacoes: `Bell`.
- Perfil: `UserRound`.

## 8. Acessibilidade

- Contraste adequado em texto e badges.
- Texto de status sempre explicito.
- Botoes com labels compreensiveis.
- Navegacao responsiva sem sobrepor conteudo.
