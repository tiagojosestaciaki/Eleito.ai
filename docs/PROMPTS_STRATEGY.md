# Prompts Strategy — elleito.ai

Este documento descreve a **estratégia de system prompts** como ativo principal do produto. Vai além das convenções de pasta (ver [/prompts/README.md](../prompts/README.md)) e entra em: testes A/B, métricas de qualidade, governança.

## Tese central

O elleito.ai é um produto de IA aplicada a contexto político regional. Qualquer concorrente com acesso à Claude API consegue replicar o stack. O que diferencia é **a qualidade das respostas nos pilares 2 (chat), 4 (narrativas) e 5 (crise)** — e essa qualidade depende diretamente do prompt.

Tratar prompts como strings soltas jogadas no código é o caminho mais curto para um produto medíocre. Tratá-los como código versionado, testado e monitorado é o que transforma "usa Claude" em "tem experiência política codificada".

## Estrutura de um prompt de produção

Cada prompt em `/prompts/<pilar>/vN.md` segue:

1. **Papel**: "Você é um estrategista político sênior especializado em..."
2. **Contexto regional injetado**: via RAG sobre `regional_context`
3. **Dados disponíveis**: referências às tools (function calling) ou ao input estruturado
4. **Formato de saída**: schema JSON ou descritivo, **rigoroso** — parsing falho é bug
5. **Guardrails**: o que **não** responder, quando dizer "não sei", riscos a marcar explicitamente
6. **Tom**: direto, sem adjetivo floreado, em português do Brasil

## Versionamento

- **Imutabilidade**: `v1.md` nunca é editado depois de promovido. Mudou? É `v2.md`.
- **Referência em runtime**: cada chamada LLM registra `prompt_version` no banco. Permite auditar qual versão gerou qual resposta.
- **CHANGELOG por pasta**: descreve mudança, motivação, métricas antes/depois.

## Golden sets (testes de regressão)

Cada pilar tem um **golden set** de 15–30 casos de teste versionados:

```
tests/prompts/
├── chat/
│   ├── cases.json           # {id, input, expected_criteria}
│   └── run_chat_eval.py
├── narratives/
│   └── ...
└── crisis/
    └── ...
```

Para cada caso, o critério de aceite pode ser:

- **Exact match** (raro, só em classificadores): sentimento deve ser `negative`
- **Keyword presence**: a resposta deve mencionar "mesorregião" e citar pelo menos 2 municípios
- **Semantic match**: resposta avaliada por um modelo auxiliar (Haiku) contra uma rubrica
- **Human review**: marcado como "exige revisão humana" — revisor compara `v_old` vs `v_new`

Regra: **não promove para produção se regressão observada em mais de 2 casos sem justificativa.**

## Testes A/B em produção

Quando uma mudança grande de prompt é arriscada, rodamos **canary**:

- 10% das chamadas para `v_new`, 90% para `v_atual`
- Métricas coletadas: latência, tokens, taxa de tool_use, avaliação humana amostral
- Janela de 24–72h (depende do volume)
- Promoção só com ganho significativo em alguma métrica sem regressão nas demais

Toggle controlado por `feature_flags` (sim, a mesma estrutura do produto).

## Métricas de qualidade

| Métrica | Como medir | Limiar |
|---------|-----------|--------|
| **Latência P95** | Tempo entre request e resposta final | < 8s (chat), < 15s (crise) |
| **Custo por mensagem** | `tokens * preço` logado em `chat_messages` | < R$ 0,30 (chat), < R$ 1 (crise) |
| **Taxa de tool_use coerente** | % de chamadas onde a tool escolhida era apropriada | > 90% |
| **Qualidade percebida (NPS da resposta)** | Thumbs up/down no final da mensagem | > 70% positivas |
| **Taxa de "não sei" adequada** | Quando o modelo deveria recusar, ele recusa? | > 85% |
| **Alucinação factual** | Revisor humano detecta citação inventada | < 2% |

Métricas aparecem em PostHog + Supabase + painel admin.

## Governança

- **Autor do prompt**: preferencialmente estrategista político + engenheiro de IA em dupla
- **Revisor**: pelo menos um revisor não-engenharia, com conhecimento de política regional
- **Aprovação**: PR merge só com golden set passando e aprovação do revisor
- **Rollback**: trocar config de runtime de `v2` para `v1` — não requer deploy

## Anti-padrões comuns

- ❌ Editar prompt em produção direto no dashboard — bypass de versionamento
- ❌ Prompts longos sem estrutura clara — `claude.ai` ≠ produção
- ❌ Instruções ambíguas ("seja breve" sem definir limite) — o modelo interpreta errado
- ❌ Não definir formato de saída — parsing frágil
- ❌ Não ter fallback quando o modelo se recusa
- ❌ Prompt inglês para resposta em português — Claude responde mas perde nuance
