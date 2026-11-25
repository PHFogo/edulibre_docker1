# Gestão do projeto

## Processo de trabalho

O projeto usa **Kanban no Jira** com o fluxo: Backlog → A fazer → Em andamento → Em validação → Concluído. Cada item possui descrição, critérios de aceite, responsável, Pull Request e evidência de teste. As branches seguem o padrão `feat/EDLIBRE-<id>-<resumo>`.

## Cynefin e abordagem de trabalho

A classificação é feita conforme o tipo de problema, não apenas pela quantidade de componentes do sistema:

| Domínio | Exemplo no EduLivre | Abordagem |
| --- | --- | --- |
| Claro | Ajuste de texto, cor, rota ou validação conhecida | Seguir procedimento padronizado e revisar |
| Complicado | Configuração de Docker/Nginx, RBAC e integrações com solução conhecida | Analisar, consultar boas práticas, implementar e testar |
| Complexo | Experiência de uso e notificações em tempo real, que exigem observar o comportamento integrado | Fazer experimentos pequenos, observar os resultados e adaptar |
| Caótico | Indisponibilidade da API durante uma demonstração | Conter o impacto, restaurar o serviço, comunicar e registrar o incidente |

Assim, o EduLivre combina atividades dos domínios Complicado e Complexo; a existência de vários serviços, por si só, não torna todo o projeto Complexo. A abordagem de trabalho é **híbrida**: arquitetura, critérios de entrega e aspectos previsíveis são planejados, enquanto a implementação evolui incrementalmente em itens priorizados no Jira, com Pull Requests, revisão, testes e ajustes contínuos. A integração contínua é automatizada; a implantação é feita manualmente com Docker Compose.

## Ciclo de vida

O trabalho combina planejamento de entregas com execução ágil e incremental. As fases abaixo organizam o ciclo sem impedir revisões e ajustes ao longo do desenvolvimento:

- **Iniciação:** alinhamento do problema, dos objetivos e dos requisitos do EduLivre.
- **Planejamento:** organização do backlog no Jira e definição da arquitetura, registrada em diagramas C4, decisões arquiteturais (ADRs), modelagem de domínio e contrato OpenAPI.
- **Execução:** implementação incremental em branches e Pull Requests, incluindo backend, microsserviços, Redis, infraestrutura Docker/Nginx e frontend.
- **Monitoramento e controle:** acompanhamento dos itens no Jira, execução do CI e dos testes, revisão das entregas e correção de falhas.
- **Encerramento:** validação dos critérios de aceite, reunião das evidências de PRs e testes e aplicação do checklist de release/rollback.

## Papéis e responsabilidades

Responsabilidades conforme a divisão de trabalho da equipe; a integração de eventos com Redis Pub/Sub é compartilhada:

- **Pablo Henrique Fogo:** arquitetura de software, infraestrutura Docker/Nginx, microsserviço de mídia, integração de eventos Redis Pub/Sub, CI e desenvolvimento full-stack.
- **Thaila Mayna Da Silva:** organização do projeto no Jira, microsserviço de pagamentos (NestJS), cache Redis, notificações/checkout, QA e colaboração na integração Redis Pub/Sub.

## Product Backlog priorizado

| Prioridade | História | Critérios de aceite resumidos |
| --- | --- | --- |
| P0 | Como aluno, quero recuperar minha senha por e-mail | OTP de seis dígitos, expiração, limite de tentativas e senha atualizada |
| P0 | Como aluno, quero pagar uma aula aceita | Pix/cartão simulado, aprovação/recusa, auditoria sem dados sensíveis |
| P0 | Como administrador, quero moderar aulas | bloquear/desbloquear com notificação persistente ao professor |
| P1 | Como usuário conectado, quero receber alertas ao vivo | SSE autenticado, evento Redis e sino atualizado sem recarregar |
| P1 | Como administrador, quero comunicar manutenção | painel com modelos de comunicado e broadcast em tempo real |
| P1 | Como professor, quero imagens otimizadas | validação de imagem e conversão WebP pelo serviço de mídia |
| P2 | Como equipe, quero rastrear qualidade continuamente | CI, healthcheck, logs e documentação operacional |

## Evidências para anexar no Jira

- PRs vinculadas a cada ticket e CI verde.
- Captura do `health/ready` com banco, Redis e pagamento `up`.
- Captura de cache Redis em MISS/SET.
- Duas sessões de navegador mostrando comunicado ou nova aula recebida em tempo real.
- Checkout Pix aprovado, cartão de teste recusado e comprovante exibido no agendamento.
- Upload de imagem convertido/servido pelo microsserviço de mídia.
