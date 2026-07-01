# Roadmap — elleito.ai (v3)

**Documento vivo.** Reflete a [Visão de Produto v3](./PRODUCT_VISION_v3.md) — ciclo de 60 dias organizado em 4 blocos de 2 semanas. Substitui o roadmap anterior (7 fases longas), arquivado em [`docs/ROADMAP_v2.md`](./docs/ROADMAP_v2.md) para histórico.

## Princípios do ciclo

- **5h/semana** de envolvimento do Tiago. O agente Claude Code executa a maior parte do trabalho técnico.
- **Cada bloco de 2 semanas entrega valor demonstrável** — nunca só "infraestrutura".
- **Foco no Motor** (CRM político via WhatsApp) porque é o produto que vende sozinho e onde o elleito.ai não tem concorrente direto.
- **Cérebro e Operação em segundo plano** durante o ciclo — o mapa e as análises funcionam pra demo, mas quem paga a assinatura no início paga pelo Motor.

## Visão geral

```
Semanas 1-2 ─► Semanas 3-4 ─► Semanas 5-6 ─► Semanas 7-8
 Estrutura     Motor MVP      Motor          Primeiro
                              avançado       cliente piloto
```

## Estado atual

| Bloco | Situação |
|-------|----------|
| Semanas 1-2 · Estrutura | **Em andamento** — reorganização do dashboard em 3 módulos |
| Semanas 3-4 · Motor MVP | Planejado |
| Semanas 5-6 · Motor avançado | Planejado |
| Semanas 7-8 · Primeiro cliente piloto | Planejado |

---

## Semanas 1-2 — Estrutura

**Objetivo:** dashboard reorganizado para refletir os 3 módulos da v3 antes de qualquer feature nova. Cliente que vê o produto na primeira demo entende a visão do todo mesmo com 90% das features ainda por construir.

### Entregáveis

- Sidebar lateral fixa de 240px com os 3 módulos (Motor, Cérebro, Operação) e submenu do Cérebro
- Tela inicial `/dashboard` como visão geral honesta — 3 cards de módulos + linha do tempo do roadmap, **sem KPIs falsos**
- Mapa eleitoral migrado para `/dashboard/cerebro/mapa` (rota antes na home)
- Placeholders reais em `/dashboard/motor`, `/dashboard/operacao`, `/dashboard/cerebro/{analises,narrativas,crise}` com promessa do módulo + status "em construção"
- Página índice do Cérebro em `/dashboard/cerebro` mostrando as 4 sub-features com status claro
- Documentação: [`docs/NAVIGATION.md`](./docs/NAVIGATION.md) mapeando rotas para módulos
- Identidade visual unificada mantida (dark mode, laranja como cor de ação)

### Critérios de saída

- [ ] Toda URL da sidebar responde 200, nenhum 404
- [ ] Home mostra saudação personalizada + data pt-BR + 3 cards de módulos + linha do tempo
- [ ] Mapa funcionando exatamente como antes, agora em `/dashboard/cerebro/mapa`
- [ ] Layout responsivo desktop/tablet/mobile (drawer no mobile)
- [ ] Autenticação inalterada, banco intocado

---

## Semanas 3-4 — Motor MVP (CRM Político)

**Objetivo:** criar o ativo central do Motor — o banco vivo de contatos, interações e demandas — com interface web boa o suficiente para o gabinete alimentar todo dia.

### Entregáveis

- **Schema novo no Supabase:**
  - `contatos` (lideranças, eleitores-chave, autoridades, mídia)
  - `interacoes` (reuniões, ligações, mensagens, eventos)
  - `demandas` (pedidos da base, status, prazo)
  - `promessas` (compromissos do político, status de cumprimento)
  - `eventos` (agenda de campo)
- Interface web para o gabinete:
  - Cadastro e edição de contatos com categoria, região, tags
  - Registro rápido de interação (formulário curto, opção de áudio depois)
  - Kanban / lista de demandas com filtros
  - Busca com dedup por nome + telefone
- Importação de contatos via **CSV** (gabinete normalmente já tem planilha; ponto de partida)
- Visualização básica: lista, busca, filtros por região e categoria

### Critérios de saída

- [ ] Importar CSV com 500 contatos reais rodando em < 30s
- [ ] Cadastrar contato + registrar 1 interação em < 60s pelo web
- [ ] Busca por nome parcial retorna em < 200ms
- [ ] RLS por organização em todas as novas tabelas
- [ ] Tiago consegue popular o banco de um piloto real com dado de campo

---

## Semanas 5-6 — Motor avançado (WhatsApp + IA)

**Objetivo:** momento "uau" do produto. Deputado no carro, manda áudio pelo WhatsApp, recebe em 5 segundos a resposta com nome, contexto e demandas pendentes.

### Entregáveis

- Integração **WhatsApp Business API** (Twilio ou Z-API — decisão em Semana 3)
- **Endpoint webhook** que recebe mensagens (texto e áudio)
- **Whisper** para transcrição de áudio em pt-BR
- **Claude API** com function calling + RAG sobre o banco de contatos
- Resposta contextualizada em até 5 segundos, formato conversacional
- **Logs e auditoria** de todas as interações (custo LLM, latência, tokens)
- Sistema aprende padrões do gabinete com o uso (embeddings de interações passadas)
- Página de configurações do usuário para ligar WhatsApp e permissões

### Critérios de saída

- [ ] Golden set de 20 perguntas responde correto e com dado real do banco
- [ ] Latência P95 < 5s (texto), < 8s (áudio incluindo Whisper)
- [ ] Custo médio por mensagem < R$ 0,20
- [ ] Demo funciona sem intervenção pra 3 tipos de pergunta:
  identidade ("quem é X"), histórico ("última interação com X"),
  contexto regional ("liderança da saúde no bairro Y")

---

## Semanas 7-8 — Polimento e primeiro cliente piloto

**Objetivo:** primeiro cliente piloto pagando (ou usando o beta gratuito) até o fim da Semana 8.

### Entregáveis

- **Onboarding guiado** no primeiro login (setup da organização, feature flags, tour rápido)
- **Documentação para o gabinete:** como cadastrar, como importar, como usar o WhatsApp
- **Página de configurações:** perfil do cliente, integrações WhatsApp, gestão de usuários da organização
- **Sistema de billing básico** — pode ser cobrança manual nos primeiros 3 clientes; o importante é fluxo de contrato + faturamento definido
- **ETL real do TSE** rodando para o Paraná completo (Cérebro alimentado com dados oficiais em vez do seed mock atual)
- **Primeira demo formal** para 2-3 prospects qualificados
- **Ajustes de UX** que aparecerem na demo — 2-3 dias reservados para retrabalho

### Critérios de saída

- [ ] 1 cliente piloto ativo com pelo menos 200 contatos cadastrados
- [ ] Piloto consulta o sistema via WhatsApp pelo menos 3× por semana
- [ ] Feedback estruturado do piloto: NPS, 3 dores, 3 elogios
- [ ] Contrato ou acordo comercial formalizado (mesmo que gratuito no beta)
- [ ] Deploy em produção estável por 7 dias sem erro crítico

---

## Fora do escopo destes 60 dias

Ver [`PRODUCT_VISION_v3.md`](./PRODUCT_VISION_v3.md) para o rationale completo. Resumo do que **NÃO** entra neste ciclo:

- App mobile nativo (web responsivo é suficiente)
- Predição estatística de resultados
- Coleta ao vivo de rádio AM, WhatsApp público, câmaras municipais
- Chat copiloto livre (só function calling estruturado)
- Cobertura nacional (foco PR é fosso)
- Módulo de compliance eleitoral / prestação de contas
- Plataforma multi-cliente com revenda

## Após os 60 dias

Se o piloto validar o Motor, os próximos ciclos entram nas capacidades avançadas do **Cérebro** (análises sugeridas, gerador de narrativas, contenção de crise via UI dedicada) e nas primeiras entregas do **Operação** (briefings automáticos, alertas de tendência).

Documentos de referência para as próximas fases já existem:

- [`docs/CRISIS_FLOW.md`](./docs/CRISIS_FLOW.md) — fluxo completo do módulo de crise
- [`docs/TRENDS_DETECTION.md`](./docs/TRENDS_DETECTION.md) — algoritmo de detecção de anomalias
- [`docs/PROMPTS_STRATEGY.md`](./docs/PROMPTS_STRATEGY.md) — estratégia de prompts como ativo
