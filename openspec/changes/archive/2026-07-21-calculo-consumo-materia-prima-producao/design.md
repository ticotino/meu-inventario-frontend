## Context

Hoje, ao registrar uma `Producao` (`src/pages/producao/NovaProducao.tsx`), o usuário escolhe um produto, informa a quantidade produzida, e para cada matéria-prima consumida digita manualmente a quantidade — de cabeça, calculando na hora a partir da largura do rolo de tecido disponível e das dimensões da peça que está cortando. O dono da oficina explicou o raciocínio real por trás dessa conta, com dois exemplos concretos:

- Lençol 160×250cm, rolo de 2,50m (250cm) de largura → consome 1,65m por peça.
- Lençol 250×280cm, mesmo rolo de 2,50m → consome 2,85m por peça.

Em ambos os casos, uma das duas dimensões da peça é exatamente igual à largura do rolo (250cm) — porque ele sempre escolhe o tecido certo pra peça, cortando de forma que uma dimensão "bata" com a largura disponível. O consumo por peça é a OUTRA dimensão + 5cm fixos de folga para acabamento/costura, convertida para metros. Essa regra foi deduzida a partir dos dois exemplos e confirmada explicitamente pelo usuário, junto com dois esclarecimentos importantes: a margem de 5cm é sempre fixa (não varia com o tamanho da peça), e o caso de "nenhuma dimensão bate com nenhum rolo disponível" não acontece na prática — ele sempre corta considerando a largura do rolo que tem em mãos.

A largura do rolo VARIA por tecido — a maioria usa 2,50m, mas tecidos para uniforme hospitalar e campo cirúrgico usam 1,85m. Isso não existe hoje como campo em `MateriaPrima`. Dimensões de peça também não existem em `Produto` — hoje é só `codigo`/`nome`/`descricao`.

O projeto já tem um precedente direto para "sugestão calculada, mas editável": `sugestoes()` em `src/modules/romaneios/service.ts` (backend) e `SugestaoCaixa` em `src/types/romaneio.ts` (frontend) — a última `quantidade_por_caixa` usada para aquele produto é sugerida ao montar um romaneio novo, mas o campo continua editável. Este design segue o mesmo formato.

## Goals / Non-Goals

**Goals:**
- Produto ganha dimensões opcionais (largura × comprimento, em cm).
- Matéria-prima ganha largura de rolo opcional (em cm).
- Ao registrar produção, o sistema sugere (não trava) a quantidade consumida de matérias-primas com largura de rolo compatível com uma das dimensões do produto selecionado.
- Metragem de tecido exibida sempre com 2 casas decimais fixas.

**Non-Goals:**
- Não constrói um sistema de nesting/otimização de corte (layout de múltiplas peças num rolo) — é um cálculo direto por peça, não uma otimização.
- Não obriga preenchimento de dimensões em produtos existentes nem em novos produtos — são campos opcionais, com fallback para entrada manual.
- Não lida com o caso "nenhuma dimensão bate com a largura de nenhum rolo disponível" além de simplesmente não sugerir nada (cai no comportamento manual atual) — o usuário confirmou que esse caso não ocorre na prática.
- Não muda a unidade de medida de matéria-prima nem introduz um tipo de produto "corte e costura" separado dos demais — dimensões são só mais dois campos opcionais em qualquer produto.

## Decisions

**1. Dimensões e largura de rolo em centímetros internamente, exibidas em metros.**
`Produto.largura_cm`/`Produto.comprimento_cm` e `MateriaPrima.largura_rolo_cm` são armazenados e trafegam como centímetros (inteiros ou decimais). Motivo: dimensões de peça são naturalmente faladas/cadastradas em centímetros ("160×250"), e comparar/calcular em uma unidade só evita conversão fracionária constante (2,50m vira 250cm exato, sem casas decimais repetidas). A exibição ao usuário na tela de matéria-prima mostra a largura de rolo já convertida para metros (ex.: "2,50 m"), consistente com o restante do sistema que fala de metragem em metros — só o campo internamente é cm. Alternativa considerada — manter tudo em metros (decimal) como as outras quantidades de matéria-prima — rejeitada porque a comparação "dimensão da peça == largura do rolo" ficaria sujeita a erro de arredondamento decimal (250cm vs 2.5m vs 2.50m escrito com precisões diferentes).

**2. Compatibilidade dimensão-peça ↔ largura-de-rolo por igualdade exata em cm, sem tolerância.**
Como ambos os valores são armazenados em cm (inteiros), a comparação é `produto.largura_cm === materiaPrima.largura_rolo_cm || produto.comprimento_cm === materiaPrima.largura_rolo_cm` — sem margem de tolerância. Motivo: o usuário descreveu um corte que bate exatamente com a largura do rolo (é assim que ele compra/corta), então uma tolerância só mascararia um cadastro errado. Alternativa considerada — tolerância de ±1-2cm para absorver imprecisão de medição — rejeitada por ora; se no uso real houver folga real de medição, revisar depois (ver Open Questions).

**3. Cálculo do consumo sugerido: dimensão que NÃO bate + 5cm fixos, × quantidade produzida.**
```
ladoQueBate = produto.largura_cm === materiaPrima.largura_rolo_cm ? "largura" : "comprimento"
ladoConsumido_cm = ladoQueBate === "largura" ? produto.comprimento_cm : produto.largura_cm
consumoPorPeca_m = (ladoConsumido_cm + 5) / 100
quantidade_consumida_sugerida = consumoPorPeca_m * quantidade_produzida
```
Se AMBAS as dimensões do produto batem com a largura do rolo (peça quadrada com o mesmo valor da largura do rolo nos dois lados), usa-se `comprimento_cm` como lado consumido por convenção (arbitrário, mas determinístico) — caso extremo raro, não mencionado pelo usuário, documentado aqui para não deixar o comportamento indefinido.

**4. Sugestão sempre editável, nunca travada.**
Segue exatamente o padrão já usado por `SugestaoCaixa`/`sugestoes()` em Romaneios: o valor calculado pré-preenche o campo `quantidade_consumida`, mas o usuário pode digitar por cima livremente antes de salvar — sem re-cálculo forçado, sem bloqueio. Motivo: o próprio usuário pediu isso explicitamente, para poder ajustar sobra/perda real na hora de cortar.

**5. Campos opcionais em Produto e MateriaPrima, sem quebrar cadastros existentes.**
`largura_cm`/`comprimento_cm` (Produto) e `largura_rolo_cm` (MateriaPrima) são nullable — produtos/matérias-primas já cadastrados continuam funcionando exatamente como hoje (entrada manual de `quantidade_consumida`), sem exigir migração de dados retroativa. Quando o produto selecionado não tem dimensões, ou nenhuma matéria-prima ativa tem largura de rolo compatível, `NovaProducao.tsx` simplesmente não mostra nenhuma sugestão — comportamento idêntico ao atual.

**6. Formatação de metragem: `minimumFractionDigits` específico para a unidade `metro`.**
Em `formatarQuantidade` (`src/utils/format.ts`), a unidade `metro` passa a usar `Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 3 })` — sempre pelo menos 2 casas decimais, mas ainda aceitando a 3ª casa quando existir (ex.: "1,655" continua exibindo as 3 casas se o valor realmente tiver essa precisão; "30" vira "30,00"). As demais unidades (`kg`, `unidade`, `rolo`) continuam com o comportamento atual, sem mínimo de casas decimais — o pedido do usuário foi especificamente sobre metragem de tecido, e forçar 2 casas em `unidade` (ex.: "30,00 unidades") soaria estranho para contagem de peças inteiras.

## Risks / Trade-offs

- **[Risco] Comparação por igualdade exata em cm pode nunca "casar" se o cadastro tiver um erro de digitação de 1cm** (ex.: rolo cadastrado como 249cm em vez de 250cm) → Mitigação: nenhuma automática por ora (ver decisão 2); se isso se mostrar frequente no uso real, revisitar com uma tolerância pequena.
- **[Risco] Migração de dados existentes**: produtos e matérias-primas já cadastrados não têm dimensões/largura de rolo — o cálculo automático simplesmente não aparece para eles até serem editados → Mitigação: aceito conscientemente (Non-Goal explícito); não é uma migração de dados retroativa, é preenchimento manual gradual conforme o usuário for revisando cadastros.
- **[Risco] Caso raro de produto quadrado (ambas dimensões batem com a largura do rolo)** → Mitigação: comportamento determinístico definido na decisão 3 (usa `comprimento_cm`), documentado para não ficar ambíguo, mesmo sem exemplo real do usuário para esse caso.

## Open Questions

- Se, no uso real, aparecer um caso onde a dimensão da peça "quase bate" com a largura do rolo (diferença de 1-2cm por imprecisão de medição/corte), vale introduzir uma tolerância pequena na comparação (decisão 2)? Fica em aberto até acontecer.
- Vale destacar visualmente (não só filtrar) as matérias-primas compatíveis no Select de `NovaProducao.tsx`, ou basta pré-preencher o valor quando uma compatível for escolhida? Decisão de UI fina, a resolver durante a implementação.
