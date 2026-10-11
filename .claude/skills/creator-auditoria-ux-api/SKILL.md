---
name: creator-auditoria-ux-api
description: Auditoria completa de UX, conteúdo e integrações TikTok do TikTally Creator — sobe o app em localhost com o mock, navega todas as telas, traduz/simplifica textos para pt-BR, confronta requests/responses/mappers com a skill tts-openapi-guide, CORRIGE o que encontrar e entrega relatório de cobertura. Use quando o usuário pedir auditoria, revisão de textos/traduções, revisão de UX ou validação das APIs TikTok no Creator.
---

# Skill: Auditoria de UX, Conteúdo e Integrações do Creator

## Objetivo

Executar uma auditoria completa no projeto Creator, garantindo que todas as telas tenham textos claros, linguagem acessível, dados corretamente apresentados e integração consistente com as APIs do TikTok.

A execução deve ser prática: **não apenas identificar problemas, mas implementar as correções necessárias**, respeitando a arquitetura, os padrões e as regras de negócio existentes.

## Etapa 1: Inicialização do ambiente

1. Analisar a estrutura do projeto Creator e identificar os comandos necessários para executá-lo.
2. Instalar dependências somente quando necessário.
3. Iniciar a aplicação em localhost.
4. Verificar se a aplicação está funcionando corretamente e sem erros críticos.
5. Identificar o ambiente de mock já disponível no projeto.
6. Realizar a autenticação utilizando o mock, sem depender de credenciais reais.
7. Confirmar que o usuário autenticado possui acesso às funcionalidades necessárias para a auditoria.

**Importante:** Não criar um novo sistema de autenticação ou modificar o fluxo existente sem necessidade.

## Etapa 2: Navegação e mapeamento das telas

Navegar por todas as telas disponíveis na aplicação, incluindo:

- Dashboard e visão geral.
- Relatórios e indicadores financeiros.
- Métricas de desempenho.
- Integrações e contas conectadas.
- Configurações e perfil.
- Modais, formulários, filtros e menus.
- Estados de carregamento, erro e ausência de dados.
- Telas secundárias acessadas por botões, links e ações.

Criar um inventário das rotas e telas encontradas para garantir que nenhuma funcionalidade seja ignorada.

Não considerar uma tela validada apenas por abri-la. Interagir com seus componentes e verificar os diferentes estados da interface.

## Etapa 3: Auditoria e correção de textos

Em cada tela, inspecionar todos os textos visíveis ao usuário.

### 3.1 Idioma

- Identificar textos que estejam em inglês.
- Traduzir para português brasileiro (pt-BR).
- Não traduzir nomes oficiais de produtos, marcas ou termos que façam parte da identidade do TikTok.
- Manter consistência terminológica entre todas as telas.

### 3.2 Clareza e linguagem

Identificar textos excessivamente técnicos, ambíguos ou difíceis de compreender.

Substituir por linguagem simples, objetiva, profissional e adequada ao público de criadores de conteúdo.

Exemplos:

| Texto original | Texto sugerido |
|---|---|
| Revenue | Receita |
| Estimated Commission | Comissão estimada |
| Settlement | Valor a receber ou Liquidação, conforme o contexto |
| Gross Merchandise Value (GMV) | Valor total das vendas |
| Conversion Rate | Taxa de conversão |
| API Sync Failed | Não foi possível atualizar seus dados |
| No Data Available | Nenhum dado disponível |
| Fetching Metrics | Atualizando seus indicadores |

As traduções devem considerar o significado funcional de cada campo, não apenas sua tradução literal.

### 3.3 Experiência do usuário

Verificar se:

- Os títulos representam corretamente o conteúdo.
- Botões possuem ações facilmente compreensíveis.
- Mensagens de erro explicam o problema e, quando possível, como resolvê-lo.
- Indicadores financeiros possuem nomes claros.
- Tooltips explicam métricas e conceitos menos conhecidos.
- Estados vazios orientam o usuário sobre o próximo passo.
- Datas, moedas, números e porcentagens seguem o padrão brasileiro.
- Não existem textos provisórios, placeholders indevidos ou mensagens internas de desenvolvimento.
- A mesma métrica recebe o mesmo nome em todas as telas.

### 3.4 Implementação

Corrigir diretamente os textos no código-fonte.

Respeitar o mecanismo de internacionalização existente, quando houver.

Evitar duplicação de strings e preservar a consistência visual, especialmente quando os novos textos forem maiores que os anteriores.

Não modificar nomes de propriedades, contratos de API ou identificadores técnicos apenas para traduzir sua apresentação na interface.

## Etapa 4: Validação das APIs do TikTok

Após concluir a auditoria textual, utilizar a **skill oficial de integração TikTok já instalada** como referência técnica:

- `tts-openapi-guide` — contratos de endpoint (método, path, headers, request/response schema, versão). **Referência principal.**
- `tts-openapi-faq-index` — troubleshooting de auth, token, assinatura e erros comuns.
- `tts-open-platform-glossary` — significado de termos (GMV, settlement etc.) para apoiar as traduções da Etapa 3.

Não substituir essas skills por suposições ou documentação genérica.

### 4.1 Requests

Auditar todos os endpoints utilizados pelo Creator, verificando:

- Método HTTP e endpoint.
- Headers obrigatórios.
- Autenticação e permissões.
- Query parameters.
- Path parameters.
- Request body.
- Campos obrigatórios e opcionais.
- Tipos de dados.
- Paginação.
- Filtros e intervalos de datas.
- Versões da API.

Validar se todos os campos necessários estão corretamente mapeados e enviados conforme o contrato documentado.

### 4.2 Responses

Para cada endpoint, validar:

- Estrutura completa da resposta.
- Campos obrigatórios e opcionais.
- Tipos, enums e valores possíveis.
- Campos nulos ou ausentes.
- Objetos aninhados.
- Arrays e estruturas paginadas.
- Mapeamento entre DTOs, modelos de domínio e dados apresentados na interface.
- Tratamento de erros e respostas inesperadas.

Identificar campos disponíveis na API que não estão mapeados no projeto.

Avaliar se esses campos são relevantes para as funcionalidades existentes. Não adicionar campos desnecessários apenas porque a API os disponibiliza.

### 4.3 Consistência dos dados

Validar o caminho completo dos dados:

**API TikTok → Response DTO → Mapper → Modelo de domínio → Estado da aplicação → Interface**

Garantir que:

- Os valores exibidos correspondam aos campos corretos da API.
- Indicadores financeiros não confundam valores brutos, líquidos, estimados e efetivamente recebidos.
- Percentuais sejam calculados corretamente.
- Valores monetários utilizem a moeda e a escala corretas.
- Datas respeitem o fuso horário e o contexto das informações.
- Campos ausentes não produzam números incorretos.
- Os mocks representem estruturas compatíveis com os contratos reais.

Não utilizar valores fictícios como fallback silencioso para dados financeiros indisponíveis.

## Etapa 5: Correção das integrações

Corrigir os problemas identificados nos requests, responses, DTOs, mappers e demais camadas necessárias.

Durante essa etapa:

1. Preservar a arquitetura existente.
2. Evitar mudanças desnecessárias nos contratos internos.
3. Não remover funcionalidades.
4. Não alterar regras de negócio sem justificativa.
5. Não expor tokens, segredos ou credenciais.
6. Manter compatibilidade com o ambiente de mock.
7. Criar ou atualizar testes quando necessário.

Quando houver divergência entre a implementação e a documentação disponível, registrar a diferença e aplicar somente correções sustentadas pelo contrato da API.

## Etapa 6: Validação final

Após implementar todas as correções:

1. Executar verificações de lint, tipagem e build disponíveis.
2. Executar os testes automatizados relevantes.
3. Reiniciar ou atualizar a aplicação local.
4. Autenticar novamente com o mock.
5. Navegar pelas telas impactadas.
6. Verificar se os textos corrigidos estão aparecendo corretamente.
7. Confirmar que componentes e layouts não foram quebrados.
8. Validar requests e responses utilizando mocks ou testes de contrato.
9. Conferir se os valores apresentados na interface correspondem aos dados retornados.

Não considerar um problema corrigido sem realizar a validação correspondente.

## Etapa 7: Relatório final

Ao concluir, apresentar um relatório contendo:

### Auditoria de interface
- Quantidade de telas identificadas e efetivamente auditadas.
- Textos traduzidos ou simplificados.
- Melhorias de usabilidade realizadas.
- Telas não verificadas e respectivos motivos.

### Auditoria das APIs
- Endpoints analisados.
- Requests corrigidos.
- Responses e mapeamentos corrigidos.
- Campos relevantes não mapeados.
- Divergências identificadas.
- Problemas que dependem de documentação ou acesso adicional.

### Qualidade
- Arquivos modificados.
- Testes executados e resultados.
- Resultado do build.
- Pendências e limitações.

## Regras obrigatórias

- **Executar, não apenas sugerir:** implementar as correções identificadas.
- **Auditar todas as telas acessíveis:** não limitar a revisão ao dashboard.
- **Priorizar linguagem humana:** o Creator é utilizado por criadores de conteúdo, não por desenvolvedores.
- **Não inventar dados:** especialmente métricas, comissões e valores financeiros.
- **Usar a skill TikTok existente:** ela é a referência principal dos contratos de integração.
- **Evitar refatorações fora do escopo:** corrigir sem introduzir complexidade desnecessária.
- **Validar após modificar:** sempre conferir o funcionamento real.
- **Informar limitações:** não declarar cobertura completa caso alguma tela ou endpoint não tenha sido validado.

## Critério de conclusão

A execução só estará concluída quando:

1. Todas as telas acessíveis pelo mock tiverem sido inspecionadas.
2. Todos os textos identificados como inadequados tiverem sido corrigidos.
3. Os contratos de request e response utilizados pelo Creator tiverem sido confrontados com a skill TikTok existente.
4. Os problemas confirmados de mapeamento tiverem sido corrigidos.
5. Os testes e a navegação final tiverem sido executados.
6. O relatório final apresentar claramente a cobertura, as correções e eventuais pendências.
