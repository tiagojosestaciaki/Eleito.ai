O PROJECT.md foi substituído pela versão definitiva e consolidada do produto. Releia ele agora com atenção. Ele agora contém 5 PILARES (não mais 2):

Pilar 1 — Dashboard de Inteligência Regional
Pilar 2 — Chat Copiloto Estratégico
Pilar 3 — Detector de Tendências com Alertas
Pilar 4 — Gerador de Narrativas Estratégicas
Pilar 5 — Contenção de Crise

Sua tarefa agora é trazer toda a documentação do projeto para o mesmo nível do PROJECT.md atualizado, incluir as decisões das 3 perguntas anteriores e preparar o terreno para a Fase 1.

Execute:

1. Releia o PROJECT.md atualizado e confirme que entendeu os 5 pilares.

2. Atualize o ROADMAP.md com as fases corretas do produto de 5 pilares:
   - Fase 1: Fundação de Dados (schema Supabase + ETL histórico TSE)
   - Fase 2: Dashboard MVP (mapa + filtros + séries históricas)
   - Fase 3: Chat Copiloto (function calling + RAG de contexto regional)
   - Fase 4: Coleta de Menções (imprensa + redes sociais)
   - Fase 5: Tendências e Alertas (detecção de anomalias + notificações)
   - Fase 6: Narrativas e Crise (fluxos guiados + geração estratégica)
   - Fase 7: Comercialização (onboarding + primeiros clientes piloto)

3. Atualize o ARCHITECTURE.md incluindo os novos componentes (ingestão de menções, detector de tendências, módulos de IA estratégica). Atualize o diagrama mermaid refletindo os 5 pilares.

4. Atualize o DATA_MODEL.md incluindo as tabelas adicionais:
   - mentions (menções coletadas com sentimento, tópicos, região, sq_candidato opcional)
   - alerts (alertas de tendência gerados com status e ações tomadas)
   - crisis_cases (histórico de crises analisadas por organização cliente)
   - narratives_generated (narrativas sugeridas com resultado real quando disponível)
   - regional_context (base de conhecimento regional com embedding via pgvector)
   - feature_flags (controle granular de features por organização, conforme ADR-003)

5. Crie a pasta /prompts na raiz do projeto com um README.md explicando:
   - Por que os system prompts são ativo crítico
   - Estrutura de organização (por pilar e por versão)
   - Convenção de versionamento (v1, v2, com changelog)
   - Processo de teste antes de promover uma versão para produção

6. Crie na pasta /docs os seguintes novos documentos:

   PROMPTS_STRATEGY.md — estratégia de system prompts como ativo principal do produto, incluindo: estrutura de cada prompt, versionamento, testes A/B, métricas de qualidade

   CRISIS_FLOW.md — fluxo detalhado da feature de contenção de crise, incluindo: diagrama do fluxo, estrutura exata de inputs, lógica de processamento, estrutura exata de outputs, prompt base versionado

   TRENDS_DETECTION.md — algoritmo de detecção de anomalias: cálculo de baseline, disparadores, análise contextual automática, pipeline de notificações

   DECISIONS_LOG.md — Architecture Decision Records. Registre as 3 decisões abaixo como ADR-001, ADR-002 e ADR-003, cada uma com Contexto, Decisão, Consequências e Data (hoje).

7. Aplique as decisões das 3 perguntas anteriores:

ADR-001 — Escopo histórico: INCLUIR VEREADORES
Incluir todos os cargos (vereador, prefeito, deputado estadual, deputado federal, senador, governador) nas eleições de 2016, 2018, 2020, 2022 e 2024 para o Paraná. Vereadores são parte do fosso competitivo do produto. Volume estimado (~150k linhas) é tratável em Postgres.

ADR-002 — LGPD: NÃO persistir dados pessoais sensíveis no MVP
Remover do schema: cpf, endereco, declared_assets, data_nascimento.
Manter: sq_candidato (chave TSE), nome_completo, nome_urna, partido, cargo, resultado, município/zona.
Motivo: reduzir superfície de responsabilidade LGPD na Fase 1. Campos sensíveis podem ser adicionados em fase futura com política de privacidade formal e caso de uso claro.

ADR-003 — Planos: modelagem flexível com feature_flags
Não travar tiers fixos no schema. Substituir por:
- users.plan TEXT (valores livres, sem enum)
- Tabela feature_flags: id uuid, organization_id uuid FK, feature_name text, enabled boolean, limits jsonb, created_at, updated_at
- RLS básico: usuário só enxerga dados da própria organização
Motivo: tiers finais só serão conhecidos após conversa com primeiros 5-10 clientes piloto.

8. Ao final, me entregue:
   - Lista de todos os arquivos criados ou atualizados neste prompt
   - Árvore de pastas completa do projeto
   - Confirmação explícita de que os 5 pilares foram incorporados em toda a documentação
   - 3 perguntas críticas sobre decisões de produto que preciso tomar antes de começar a Fase 1 (migrations + ETL)
