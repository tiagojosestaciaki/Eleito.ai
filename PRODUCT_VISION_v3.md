# Visão de Produto v3 — Sistema Operacional Político Regional

## Contexto desta v3

Esta v3 substitui a v2 após análise competitiva (eleitoai.com.br) e conversas que clarificaram o real caso de uso de quem paga pelo produto. As decisões aqui foram tomadas em conjunto com Tiago Staciaki em abril de 2026.

**Nada do que foi construído tecnicamente é descartado.** Banco, schema, mapa, auth, deploy, pacote Python de ingestão, documentação dos 5 pilares — tudo segue valendo. O que muda é o **posicionamento, a tela inicial, a prioridade das features e como elas se conectam**.

Nome do produto: temporariamente **elleito.ai** até definição de marca final. Substituição de nome no código será operação mecânica de busca e troca.

## A virada de posicionamento

A v1 e v2 posicionavam o produto como **plataforma de inteligência eleitoral**. Conceito amplo, demais. Compete com eleitoai.com.br, que tem 6-12 meses de vantagem técnica e cobertura nacional.

A v3 posiciona o produto como:

> **Sistema Operacional Político Regional.**
> Tudo que um mandato ou campanha precisa para operar no dia a dia, no Sul do Brasil, com inteligência aplicada e tempo de resposta de campo.

Não é planejamento de campanha. É **operação contínua**. Não é dashboard de dados. É **rotina diária do político**.

## Os três produtos sob o mesmo guarda-chuva

O produto é um, mas pode ser vendido em três módulos. Cada módulo entrega valor sozinho. Quem assina os três tem o sistema completo.

### Módulo 1 — Motor (CRM Político com IA via WhatsApp)

**O que é:** banco vivo de lideranças, eleitores-chave, demandas, promessas e interações da base regional do cliente. Acessado via WhatsApp por áudio ou texto. Resposta em 5 segundos.

**Caso de uso central:**
Deputado vai para um evento em São Mateus do Sul. No carro, manda áudio para o sistema:
> "Quem é o cara da saúde no bairro Bom Jesus?"

Sistema responde:
> "José Carlos, presidente da Associação de Moradores. Apoiou você em 2022 com 230 votos da região. Última interação: maio de 2025, sobre fechamento de UBS. Você prometeu retorno até julho. Telefone: (XX) XXXXX-XXXX. Ele tem 3 cobranças pendentes registradas pelo gabinete."

**Quem alimenta:** equipe do gabinete. Cadastra contatos, registra reuniões, interações de campo, demandas, promessas, eventos. Pode usar interface web ou também WhatsApp.

**Por que vende:**
- Deputado economiza 10h/semana só de organização e memória
- Equipe do gabinete vira mais eficiente, menos retrabalho
- Não existe nada parecido no mercado político brasileiro
- Resolve problema real e doloroso (esquecer nomes, perder contexto, fazer promessas duplicadas)

**Diferencial técnico:**
- WhatsApp Business API + Claude API + Whisper para áudio
- RAG sobre o banco de contatos para respostas contextuais
- Sistema aprende padrões do gabinete com o uso

### Módulo 2 — Cérebro (Inteligência de Cenário e Narrativa)

**O que é:** análise eleitoral, leitura de cenário regional, sugestão de narrativas e contenção de crise. Aqui mora boa parte do que estava nos 5 pilares originais.

**Capacidades:**
- Mapa eleitoral do PR com dados históricos do TSE (2016-2024)
- Análises sugeridas (não filtros vazios): "onde você teve maior abstenção", "comparar com adversário X", "perfil de quem você precisa reconquistar"
- Sugestões de narrativa por região, baseadas em casos históricos comparáveis
- Contenção de crise: input estruturado, output com 3 cenários de resposta, roteiros prontos
- Integração com o Motor: análises podem incluir contexto de lideranças do CRM

**Por que vende:**
- Substitui consultoria de R$ 20-50k por entrega
- Cliente recebe análises estratégicas em segundos
- Roteiros de resposta prontos para copiar e colar
- Combinado com o Motor, vira diferencial real (concorrentes têm um ou outro, ninguém tem ambos integrados)

### Módulo 3 — Operação (Comando ao Vivo)

**O que é:** sala de situação política contínua. Briefings automáticos, alertas de oportunidade e ameaça, monitoramento de menções regionais.

**Capacidades:**
- Tela inicial com **o que está acontecendo agora** na base do cliente
- Alertas de aceleração de tópicos (detector de tendências)
- Briefing automático antes de visitas a cidades
- Painel de menções na imprensa regional, redes sociais públicas, e em fase posterior, rádios AM e câmaras municipais
- Botão "Resposta Rápida" sempre visível para situações de crise

**Por que vende:**
- Deputado abre o app 5 vezes por dia mesmo sem precisar
- Sensação de "estar dentro" da política regional o tempo todo
- Lock-in operacional: quem usa não consegue mais ficar sem

**Limitação honesta para a fase inicial:**
Monitoramento ao vivo é construção de 6-12 meses. Para o lançamento, o Comando começa com:
- Briefings automáticos baseados nos dados do CRM e do Cérebro
- Alertas configurados manualmente pelo cliente
- Menções de imprensa digital regional
Coleta de rádio AM, WhatsApp público e câmaras vem em fases posteriores.

## Diferencial competitivo vs eleitoai.com.br

| Eixo | eleitoai.com.br | elleito.ai (v3) |
|------|-----------------|-----------------|
| Foco | Planejamento de campanha pré-eleitoral | Operação contínua de mandato + campanha |
| Cobertura | Nacional (5.571 municípios) | Regional profundo (PR + Sul) |
| CRM Político via WhatsApp | Não tem | **Motor central do produto** |
| Contenção de crise | Não tem | **Sim, com roteiros prontos** |
| Análise eleitoral | Forte (vantagem deles) | Suficiente (módulo Cérebro) |
| Narrativas regionais | Genéricas | Baseadas em vivência política real |
| Monitoramento ao vivo | Não tem | Sim (fase posterior, fosso longo prazo) |
| Estrategista por trás | Time de tech | **Estrategista político real (Tiago)** |

A briga não é replicar eleitoai. É posicionar como **categoria diferente**.

## Decisões de produto desta v3

1. **Reorganizar o dashboard primeiro.** Antes de qualquer feature nova, a casca do produto tem que refletir os 3 módulos. Cliente que entra hoje vê um mapa solto, sem visão do todo.

2. **Construir o Motor (CRM via WhatsApp) primeiro.** É o produto que o cliente realmente quer e paga. Aproveita expertise existente (Tiago já construiu MAIA para Face Doctor com WhatsApp + IA + Postgres).

3. **Manter o ETL real do TSE como tarefa paralela.** O ETL alimenta o Cérebro. Pode rodar enquanto o Motor é construído.

4. **Contenção de crise vem depois do Motor.** Será o segundo grande diferencial visível.

5. **Comando ao Vivo é a integração final.** Une dados do Motor, do Cérebro e de monitoramento. Construído por último.

## Roadmap técnico de 60 dias

Tiago tem aproximadamente 5h/semana para acompanhar o Claude Code. O roadmap respeita esse limite.

### Semanas 1-2: Reorganização do dashboard

**Entregáveis:**
- Sidebar lateral com 3 módulos (Motor, Cérebro, Operação) + identidade visual unificada
- Tela inicial nova (substitui o mapa como home)
- Mapa atual movido para `/dashboard/cerebro/mapa`
- Placeholders para `/dashboard/motor` e `/dashboard/operacao` com mensagens claras de "em construção"

**Por que primeiro:** dá ao cliente piloto futuro a visão completa do produto desde a primeira demo. Mesmo com 90% das features ainda por construir, ele entende o que está sendo entregue.

### Semanas 3-4: Motor MVP (CRM Político)

**Entregáveis:**
- Schema novo no Supabase: `contatos`, `interacoes`, `demandas`, `tarefas`, `eventos`
- Interface web simples para o gabinete cadastrar contatos e registrar interações
- Importação de contatos via CSV (gabinete normalmente já tem planilha)
- Visualização básica: lista, busca, filtros por região e categoria

**Por que importa:** sem dados no banco, o WhatsApp não tem o que responder. Esta etapa cria o ativo central.

### Semanas 5-6: Motor avançado (consulta via WhatsApp)

**Entregáveis:**
- Integração WhatsApp Business API (Twilio ou Z-API)
- Endpoint que recebe mensagens, processa com Claude + RAG sobre o banco
- Suporte a áudio (Whisper para transcrição)
- Resposta contextualizada em até 5 segundos
- Logs e auditoria de todas as interações

**Por que importa:** este é o momento "uau" do produto. Demo deste módulo vende sozinho.

### Semanas 7-8: Polimento e primeiro cliente piloto

**Entregáveis:**
- Onboarding guiado para novo cliente
- Documentação para gabinete (como cadastrar, como usar)
- Página de configurações (perfil do cliente, integrações WhatsApp)
- Sistema de billing básico (pode ser manual nos primeiros 3 clientes)
- ETL real do TSE rodando para o Paraná completo (módulo Cérebro alimentado com dados reais)
- Primeira demo formal para 2-3 prospects qualificados

**Meta:** primeiro cliente piloto pagando até o fim da semana 8.

## Modelo comercial revisado

### Estrutura de planos (hipótese inicial)

**Plano Motor — R$ 2.500/mês**
- CRM Político via WhatsApp
- Até 3 usuários do gabinete
- Limite: 1.000 mensagens/mês via WhatsApp

**Plano Motor + Cérebro — R$ 4.500/mês**
- Tudo do Motor
- Mapa eleitoral do PR
- Análises sugeridas
- Sugestões de narrativa
- 5 análises de crise por mês

**Plano Completo — R$ 7.500/mês**
- Tudo do Motor + Cérebro
- Comando ao Vivo
- Análises de crise ilimitadas
- Briefings automáticos
- Consultoria estratégica mensal de 1h com Tiago

**Licença para campanha — R$ 25-40k por ciclo eleitoral**
- Acesso para até 10 usuários
- Inclui treinamento da equipe
- Plantão estratégico nas semanas finais

### Caminho para R$ 100k/mês

Combinando elleito.ai com outras frentes do Tiago:

- 8 clientes Plano Motor (R$ 2.500): R$ 20.000/mês
- 5 clientes Plano Motor + Cérebro (R$ 4.500): R$ 22.500/mês
- 3 clientes Plano Completo (R$ 7.500): R$ 22.500/mês
- 2 licenças campanha por ano (média R$ 30k): R$ 5.000/mês equivalente
- **Total elleito.ai: ~R$ 70.000/mês**
- Somado a STK e outras frentes: caminho factível para R$ 100k

Meta de 12 meses: 16 clientes ativos no PR + 2 licenças campanha.

## Princípios de produto desta v3

1. **Cliente paga pelo dia a dia, não pelo extraordinário.** Features que ele usa toda manhã valem mais do que features que ele usaria uma vez no ano.

2. **Voz é input legítimo.** Político odeia digitar, ama falar. Áudio sempre aceito.

3. **Resposta vem com algo pronto.** Roteiro, contato, decisão. Nunca análise teórica que ele tenha que processar.

4. **Sistema sugere, cliente decide.** Não obrigar escolha em menu vazio.

5. **Tempo de resposta é métrica primária.** Sub-5-segundos para tudo que importa.

6. **Equipe do gabinete é stakeholder de primeira classe.** Eles alimentam o sistema. Se interface for ruim para eles, o produto morre.

## O que NÃO vamos construir nesta fase

Para ter foco real, vale dizer o que fica de fora:

- App mobile nativo (web responsivo é suficiente)
- Predição estatística de resultados (terreno minado, deixar para depois)
- Integração com sistema de gestão de campanha (TSE prestação de contas, etc)
- Cobertura nacional (foco PR é fosso, não limitação)
- Coleta de rádio AM, WhatsApp público, câmaras municipais (fase posterior, 6-12 meses)
- Chat copiloto livre (entra em fase posterior, depois que os módulos centrais estiverem maduros)
- Plataforma multi-cliente com revenda (foco em vender direto primeiro)

## Próximo passo prático

Antes de gerar prompts para o Claude Code, Tiago precisa validar essa visão v3 e autorizar a Semana 1-2 (Reorganização do dashboard).

Após autorização, próximo prompt do Claude Code será:

> Reorganizar a estrutura do dashboard atual em sidebar de 3 módulos (Motor, Cérebro, Operação) com a tela inicial sendo um dashboard novo de visão geral, não mais o mapa direto. Mover o mapa atual para uma sub-rota dentro do módulo Cérebro. Criar placeholders dos demais módulos com mensagens claras de "em construção". Adotar identidade visual unificada conforme princípios da v3.

Esse prompt segue padrão estabelecido nas fases anteriores (instruções claras, etapas validadas, sem retrabalho).

## Fechamento

A v3 é uma virada estratégica grande, mas tecnicamente é continuidade. Aproveita 80%+ do que já foi construído. O que muda é a história que o produto conta e a ordem em que as features chegam.

Esta visão se torna o documento-mãe do produto, substituindo a v2.
