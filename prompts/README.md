# /prompts — System Prompts como Código

> **Os prompts do elleito.ai são o produto.** Stack, banco e UI podem ser replicados. Os prompts, não — eles codificam experiência política real aplicada em IA.

Esta pasta contém todos os **system prompts** que o elleito.ai usa em produção. Eles são tratados com o mesmo rigor de código: versionados, revisados em PR, testados contra um golden set e promovidos de forma controlada.

## Por que é um ativo crítico

O diferencial do elleito.ai não está no Claude (qualquer concorrente consegue chave da API). Está na **codificação de experiência política aplicada aos pilares 2, 4 e 5** (chat, narrativas, crise). Essa experiência vive aqui — em prompts estruturados, testados e refinados ao longo do tempo.

Ignorar versionamento de prompts é garantia de regressão silenciosa: um ajuste sutil em produção pode degradar respostas por semanas antes de alguém perceber. Tratamos isso como tratamos qualquer código crítico.

Ver estratégia detalhada em [../docs/PROMPTS_STRATEGY.md](../docs/PROMPTS_STRATEGY.md).

## Estrutura

```
prompts/
├── README.md                  # este arquivo
├── chat/                      # Pilar 2 — Chat Copiloto
│   ├── v1.md                  # primeira versão em produção
│   ├── v2.md
│   └── CHANGELOG.md
├── narratives/                # Pilar 4 — Geração de narrativas
│   ├── v1.md
│   └── CHANGELOG.md
├── crisis/                    # Pilar 5 — Contenção de crise
│   ├── v1.md
│   └── CHANGELOG.md
├── classifier/                # Pipeline de menções (Haiku)
│   ├── sentiment_v1.md
│   ├── entities_v1.md
│   └── CHANGELOG.md
└── alerts/                    # Pilar 3 — Análise de alertas de tendência
    ├── v1.md
    └── CHANGELOG.md
```

## Convenção de versionamento

- **Arquivo por versão**: `v1.md`, `v2.md` — **imutáveis** depois de promovidas
- **CHANGELOG.md** por pasta: o que mudou entre versões, por quê, e resultado observado
- **Referência em código**: cada chamada LLM registra `prompt_version` (ex.: `chat/v2`) em `chat_messages.prompt_version`, `alerts.prompt_version`, etc.
- **Nunca edite uma versão em produção** — crie `v{N+1}` e atualize a config de runtime para apontar para ela

## Formato de um prompt versionado

Cada `vN.md` contém:

```markdown
# <pilar>/v<N>

**Status:** produção | staging | arquivado
**Data:** YYYY-MM-DD
**Autor:** nome
**Substitui:** v<N-1> (se aplicável)

## Propósito
<o que este prompt faz, em 1-3 linhas>

## Variáveis de entrada
- `{{context}}` — ...
- `{{user_profile}}` — ...

## System prompt
<!-- O texto literal enviado ao Claude. Variáveis entre {{...}} -->
...

## Exemplos few-shot (opcional)
...

## Resultado esperado (schema)
<formato JSON ou descritivo do output>

## Notas
- Comportamentos esperados
- Anti-padrões (o que o prompt deve evitar)
```

## Processo de promoção (v_N → v_{N+1})

1. **Propor**: criar `v{N+1}.md` em branch dedicada
2. **Testar contra golden set**: cada pilar tem um conjunto de ~20 casos de referência (inputs + output esperado ou critério de aceite). Rodar a nova versão e comparar com a anterior.
3. **Revisar em PR**: revisor **não-engenharia** (estrategista político) avalia qualidade das respostas em casos de teste
4. **Piloto em staging**: 24–72h com canary (10% do tráfego)
5. **Promover**: mergear, atualizar config, registrar entrada no CHANGELOG
6. **Monitorar**: se qualidade (avaliação humana amostral) cair, rollback é **trocar a config de volta** — as versões antigas continuam no repo

## Não mexer em produção por capricho

Não edite um prompt em produção porque "ficou melhor na sua cabeça". Se for para mudar, crie uma nova versão, teste, promova. Engenharia de produtos de IA é iteração disciplinada, não improviso.
