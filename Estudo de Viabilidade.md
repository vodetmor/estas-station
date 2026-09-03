# ESTUDO DE VIABILIDADE TÉCNICA, ECONÔMICA E DE IMPLEMENTAÇÃO

## ESTAS — Estação Setorizada de Tratamento de Águas Supercontaminadas

Equipe SobraQuark — Arthur de Oliveira Pontes, Estevão Silva Tomasello, Isabella de Andrade Leôncio, Lara de Souza Soares Santos, Maria Elisa Miranda de Carvalho e Vítor Machado Neves

Colégio La Salle Sobradinho — Desafio Tech La Salle 2026

Sobradinho — DF, 2026

---

## RESUMO

Este documento avalia a viabilidade técnica, econômica e institucional da implantação real da ESTAS (Estação Setorizada de Tratamento de Águas Supercontaminadas), unidade modular concebida para tratar água impossibilitada de ser processada por Estações de Tratamento de Água (ETA) convencionais após desastres ambientais — enchentes com contaminação por esgoto e rompimentos de barragem de rejeito de mineração. Apresenta-se o memorial de cálculo hidráulico das sete etapas de tratamento (filtração física e separação magnética, biossorção por biossurfactantes, desgaseificação em cascata, desinfecção fotônica UV-C, remineralização, monitoramento e armazenamento), com dimensionamento de volume pela relação V = Q × t para três cenários de vazão e contaminação de entrada, ancorados em registros reais de desastres brasileiros. Estima-se o investimento (CAPEX), o custo operacional (OPEX) e o custo por metro cúbico tratado, comparando-o à referência de uma ETA convencional. Por fim, discute-se o caminho institucional e legal pelo qual o poder público brasileiro poderia adotar, financiar e operar unidades como a ESTAS em resposta a calamidades, incluindo o marco legal aplicável e os órgãos competentes. Os valores de custo e eficiência apresentados são estimativas de ordem de grandeza, elaboradas para fins didáticos e de prospecção — não substituem ensaio de bancada, projeto executivo de engenharia nem licenciamento ambiental.

**Palavras-chave:** saneamento básico; tratamento de água; desastres ambientais; viabilidade técnico-econômica; ODS 6; política pública; defesa civil.

---

## 1 INTRODUÇÃO

O saneamento básico brasileiro convive com um déficit estrutural: em 2022, cerca de 35 milhões de pessoas não tinham acesso à água tratada e aproximadamente 100 milhões não contavam com coleta de esgoto (AGÊNCIA SENADO, 2022). Esse déficit se agrava de forma aguda quando desastres ambientais — enchentes, deslizamentos, rompimentos de barragem — destroem ou saturam a infraestrutura sanitária existente. Nesses cenários, o volume de água contaminada supera em muitas ordens de grandeza a capacidade das Estações de Tratamento de Água (ETA) convencionais, cujos processos físicos e químicos padrão (floculação, decantação, filtração, cloração) não foram dimensionados para tratar água com a carga de sedimento, patógenos e metais pesados típica de um evento de calamidade (AQUAMEC, 2019).

A ESTAS foi concebida como resposta técnica a essa lacuna: uma unidade modular, setorizada em sete etapas sequenciais, capaz de ser instalada em terraços sobre uma encosta e de operar com água bruta muito mais contaminada do que uma ETA convencional tolera. O presente estudo avança sobre o projeto de pesquisa original ao tratar explicitamente da **viabilidade de construção real** da estação: como cada etapa seria dimensionada hidraulicamente, quanto custaria implantá-la e operá-la, e por qual caminho institucional o poder público brasileiro poderia efetivamente adotá-la.

## 2 OBJETIVO DO ESTUDO

Avaliar a viabilidade de implantação da ESTAS como infraestrutura real de resposta a desastres, por meio de:

a) memorial de cálculo hidráulico do dimensionamento de cada etapa de tratamento, para três cenários de vazão e contaminação de entrada;

b) estimativa de investimento (CAPEX) e custo operacional (OPEX), com custo por metro cúbico tratado comparado à referência de uma ETA convencional;

c) proposta de caminho institucional, legal e de financiamento pelo qual o poder público brasileiro poderia adotar unidades como a ESTAS.

## 3 DESCRIÇÃO TÉCNICA DAS ETAPAS DE TRATAMENTO

A água bruta é captada por gravidade e conduzida sequencialmente pelas sete etapas descritas a seguir. Cada etapa é modelada como um módulo independente, com equipamento, mecanismo de remoção e tempo de retenção próprios — o que permite que uma etapa seja reforçada (mais tempo de contato, mais unidades em paralelo) sem redesenhar a estação inteira.

### 3.1 Etapa I — Filtração física e separação magnética

A água atravessa grades metálicas, peneiras de granulometria decrescente e um leito filtrante de brita, areia quartzosa e antracito, seguido de um canal com eletroímãs de alta intensidade. O mecanismo é de barreira física (retenção por tamanho de partícula) e de atração magnética de partículas metálicas magnetizáveis — não remove metais dissolvidos, apenas a fração sólida e particulada. Tempo de retenção de projeto: 5 minutos.

### 3.2 Etapa II — Reatores de biossurfactantes e biossorção

Tanques de reação dosam biossurfactantes sob agitação lenta; o efluente segue para painéis de biossorção que retêm os complexos metal-biossurfactante formados. Biossurfactantes são moléculas anfipáticas que complexam íons de metais pesados dissolvidos (NITSCHKE; PASTORE, 2002); a remoção depende do tempo de contato — cerca de 30 minutos, valor de referência adotado neste memorial — e da capacidade ainda livre nos painéis de biossorção. Tempo de retenção de projeto: 30 minutos.

### 3.3 Etapa III — Torres de desgaseificação em cascata

O efluente escoa por sucessivos desníveis, ampliando a interface água-atmosfera para liberar gases dissolvidos (CO₂, H₂S), captados por um sistema de exaustão filtrado. Quanto maior a superfície de contato exposta, maior a fração de gás que escapa para a fase gasosa; o pH tende a subir levemente com a saída do CO₂ dissolvido. Tempo de retenção de projeto: 3 minutos.

### 3.4 Etapa IV — Desinfecção fotônica e polimento

Câmaras fechadas com lâmpadas UV-C (200–280 nm) são seguidas de membranas cerâmicas revestidas de quitosana. A eficácia da desinfecção segue a relação **Dose = Intensidade × Tempo de exposição**, com dose mínima de 1,5 mJ/cm² exigida pela Portaria GM/MS nº 888/2021. Turbidez residual acima do VMP (5 uT) reduz a eficácia por obstruir a passagem da luz — por isso esta etapa depende da clarificação prévia nas Etapas I e II.

### 3.5 Etapa V — Remineralização e estabilização físico-química

Cartuchos de calcita e dolomita repõem cálcio, magnésio e outros sais essenciais, com referência de concentração de cálcio (10–150 mg/L), sódio (< 30–50 mg/L) e magnésio (0–50 mg/L) conforme a Portaria GM/MS nº 888/2021. A água segue para um reservatório de estabilização. Tempo de retenção de projeto: 10 minutos.

### 3.6 Etapa VI — Monitoramento e controle operacional

Sensores de pH, turbidez, temperatura, condutividade, sólidos dissolvidos totais, vazão e nível, integrados a um controlador eletrônico, validam a conformidade da água com a Portaria GM/MS nº 888/2021 antes da liberação para o reservatório final. Não é uma etapa de remoção, e sim o ponto de checagem que autoriza (ou barra) a distribuição.

### 3.7 Etapa VII — Armazenamento e distribuição

Reservatório final de água potável, protegido contra contaminação externa, com tubulações, válvulas e saída para abastecimento comunitário. Dimensionado, neste memorial, para 2 horas de autonomia de abastecimento — premissa de projeto adotada para absorver picos de demanda sem interromper o fornecimento.

## 4 MEMORIAL DE CÁLCULO HIDRÁULICO

O dimensionamento de cada etapa segue a relação fundamental de projeto de tanques e câmaras de contato:

**V = Q × t**

onde V é o volume necessário (m³), Q é a vazão de projeto (L/s) e t é o tempo de retenção (min), convertido para as mesmas unidades. Para a Etapa IV (desinfecção UV-C), o tempo de exposição não é um parâmetro de tanque, mas resulta da relação:

**t = Dose / Intensidade**

Adotando a dose mínima normativa de 1,5 mJ/cm² e uma intensidade média de 8 mW/cm² para o banco de lâmpadas (premissa de projeto, compatível com sistemas comerciais de baixa pressão em arranjo multilâmpada), obtém-se um tempo de exposição de 0,1875 segundo (0,0031 minuto).

A Tabela 1 apresenta o dimensionamento de volume e o custo civil estimado (obra + estrutura) para cada etapa, no cenário de enchente urbana (vazão de projeto de 18 L/s — o maior dos três cenários avaliados, adotado como referência de dimensionamento máximo).

**Tabela 1 — Volume e custo civil por etapa (cenário enchente urbana, Q = 18 L/s)**

| Etapa | t (min) | V = Q×t (m³) | Custo civil estimado (R$) | Equipamento (R$) |
|---|---|---|---|---|
| I — Filtração e separação magnética | 5,00 | 5,40 | 17.280 | 85.000 |
| II — Biossorção | 30,00 | 32,40 | 103.680 | 140.000 |
| III — Desgaseificação em cascata | 3,00 | 3,24 | 10.368 | 60.000 |
| IV — Desinfecção UV-C | 0,0031 | 0,003 | 11 | 120.000 |
| V — Remineralização | 10,00 | 10,80 | 34.560 | 45.000 |
| VI — Monitoramento | 1,00 | 1,08 | 3.456 | 95.000 |
| VII — Armazenamento (2h de autonomia) | 120,00 | 129,60 | 414.720 | 70.000 |
| **Total** | — | **182,52** | **584.075** | **615.000** |

Fonte: elaboração própria, com custo civil estimado em R$ 3.200/m³ de volume construído (ordem de grandeza de mercado para obra civil de contenção e câmaras de concreto) e custo de equipamento por módulo estimado a partir de referências de mercado para os componentes descritos na Seção 3.

A Tabela 2 replica o mesmo memorial para os três cenários de vazão avaliados, resultando no investimento total (CAPEX) e nos indicadores de atendimento populacional.

**Tabela 2 — Comparativo entre cenários de vazão**

| Cenário | Vazão de entrada (L/s) | Vazão de saída (L/s)¹ | Água tratada/dia (m³) | CAPEX total (R$) | Custo por m³ (10 anos)² |
|---|---|---|---|---|---|
| Chuva comum (linha de base) | 12,0 | 11,4 | 985 | 1.004.383 | R$ 1,55 |
| Enchente urbana (RS, 2024) | 18,0 | 17,1 | 1.477 | 1.199.075 | R$ 1,07 |
| Rejeito de mineração | 9,0 | 8,55 | 739 | 907.037 | R$ 2,03 |

¹ Vazão de saída = vazão de entrada × (1 − 5%), considerando perdas por lavagem de filtros, retirada de lodo e purga da cascata.
² Custo por m³ amortizando CAPEX + OPEX (R$ 38.000/mês) ao longo de 10 anos de operação contínua, dividido pelo volume total tratado no período. Referência de custo médio de uma ETA convencional brasileira: R$ 1,40/m³ (ordem de grandeza setorial).

Fonte: elaboração própria a partir do modelo de simulação desenvolvido para o aplicativo interativo do projeto.

Observa-se que o custo por metro cúbico da ESTAS fica **acima** da referência de uma ETA convencional nos cenários de menor vazão (chuva comum e rejeito de mineração) — resultado esperado, já que a ESTAS trata água muito mais contaminada, com etapas adicionais (biossorção, desgaseificação, desinfecção UV-C) que uma ETA convencional não possui. No cenário de enchente urbana, a vazão maior dilui o CAPEX fixo por metro cúbico, aproximando o custo da ESTAS da referência convencional. Esse resultado reforça que a ESTAS é dimensionada como **solução emergencial**, não como substituta de uma ETA de rotina.

## 5 CENÁRIOS DE APLICAÇÃO E REFERÊNCIA REGULATÓRIA

Os três cenários de contaminação de entrada avaliados neste estudo são ancorados em desastres reais brasileiros, com concentrações de contaminante estimadas por ordem de grandeza (não medições de campo):

**Enchente urbana** — baseado nas enchentes do Rio Grande do Sul de maio de 2024, quando a bacia do Guaíba atingiu mais de 2,3 milhões de pessoas afetadas, segundo registros da Defesa Civil estadual e do CEMADEN. A água de entrada é modelada com turbidez elevada (420 uT), presença de *Escherichia coli* e carga de amônia compatível com mistura de esgoto doméstico.

**Rejeito de mineração** — baseado nos rompimentos de barragem de rejeito de Brumadinho/MG (2019, Vale/Córrego do Feijão) e Mariana/MG (2015, Samarco/Fundão), e no garimpo ilegal de ouro na Amazônia, cujo uso de mercúrio na amalgamação contamina bacias como a do rio Tapajós (estudos Fiocruz/WWF). A água de entrada é modelada com concentração de mercúrio, chumbo, cádmio, arsênio e cromo muito acima do Valor Máximo Permitido (VMP), e pH ácido (5,4).

**Chuva comum** — cenário de linha de base, sem evento de desastre, usado como controle para dimensionar o ganho de tratar água de calamidade frente à operação de rotina.

A conformidade de saída é avaliada contra os parâmetros da Portaria de Consolidação nº 5/2017, atualizada pela Portaria GM/MS nº 888, de 4 de maio de 2021, do Ministério da Saúde, complementada pelas diretrizes da Organização Mundial da Saúde (WHO, 2022) onde a norma brasileira é omissa. A Tabela 3 resume os parâmetros centrais.

**Tabela 3 — Parâmetros de potabilidade de referência (seleção)**

| Parâmetro | VMP | Categoria |
|---|---|---|
| pH | 6,5 a 8,5 | Físico |
| Turbidez | ≤ 5,0 uT | Físico |
| Cor aparente | ≤ 15 uH | Organoléptico |
| Sólidos dissolvidos totais | ≤ 500 mg/L | Organoléptico |
| *Escherichia coli* | Ausência em 100 mL | Microbiológico |
| Cianobactérias | ≤ 10.000 células/mL | Microbiológico |
| Chumbo | ≤ 0,01 mg/L | Inorgânico |
| Mercúrio total | ≤ 0,001 mg/L | Inorgânico |
| Cádmio | ≤ 0,003 mg/L | Inorgânico |
| Arsênio | ≤ 0,01 mg/L | Inorgânico |
| Cromo | ≤ 0,05 mg/L | Inorgânico |

Fonte: Portaria GM/MS nº 888, de 4 de maio de 2021 (BRASIL, 2021).

## 6 IMPACTO SOCIAL E ATENDIMENTO POPULACIONAL

O padrão humanitário mínimo de abastecimento em resposta emergencial é de 15 litros por pessoa por dia (SPHERE ASSOCIATION, 2018), valor bastante inferior ao consumo doméstico de rotina (cerca de 110 L/pessoa/dia, referência setorial brasileira). Aplicando esse padrão à vazão de saída de cada cenário, a Tabela 4 apresenta a população potencialmente atendida por uma única unidade ESTAS.

**Tabela 4 — Atendimento populacional estimado por cenário**

| Cenário | Água tratada/dia (m³) | Pessoas atendidas (padrão emergencial, 15 L/dia) | Pessoas atendidas (padrão doméstico, 110 L/dia) |
|---|---|---|---|
| Chuva comum | 985 | 65.664 | 8.954 |
| Enchente urbana | 1.477 | 98.496 | 13.431 |
| Rejeito de mineração | 739 | 49.248 | 6.716 |

Fonte: elaboração própria.

Esses números devem ser lidos como capacidade **teórica de vazão**, não como garantia de distribuição — a logística de última milha (reservatórios móveis, caminhões-pipa, rede provisória) não está dimensionada neste estudo e seria objeto de projeto complementar.

## 7 COMO O PODER PÚBLICO PODERIA IMPLEMENTAR A ESTAS

Esta seção é uma **proposta de caminho institucional**, não a descrição de um programa já existente. Baseia-se no arranjo institucional e no marco legal brasileiro atualmente vigentes para saneamento e resposta a desastres.

### 7.1 Órgãos competentes

No nível federal, o **Ministério das Cidades** é o órgão responsável pela política de saneamento básico desde a reorganização promovida pelo novo marco do saneamento (Lei nº 14.026/2020). A resposta a desastres é coordenada pela **Secretaria Nacional de Proteção e Defesa Civil (SEDEC)**, vinculada ao Ministério da Integração e do Desenvolvimento Regional, por meio do **Centro Nacional de Gerenciamento de Riscos e Desastres (CENAD)**. A vigilância da qualidade da água é atribuição do Ministério da Saúde, via a Portaria GM/MS nº 888/2021. No nível estadual e municipal, as Coordenadorias Estaduais e Municipais de Defesa Civil seriam as operadoras naturais de uma unidade móvel como a ESTAS.

### 7.2 Marco legal aplicável

A **Lei nº 12.608/2012** institui a Política Nacional de Proteção e Defesa Civil (PNPDEC) e prevê ações de resposta e recuperação em áreas atingidas por desastres — arcabouço sob o qual uma unidade de tratamento emergencial se enquadraria. A **Lei nº 14.026/2020** (novo marco do saneamento) estabelece metas de universalização do acesso à água potável e ao esgotamento sanitário até 2033, criando incentivo regulatório para soluções que ampliem a cobertura em situações excepcionais. Em situação de calamidade pública formalmente decretada, a **Lei nº 14.133/2021** (Nova Lei de Licitações), em seu art. 75, autoriza a contratação por dispensa de licitação para atendimento emergencial — via pela qual a aquisição ou instalação de uma unidade ESTAS poderia ser viabilizada rapidamente após um desastre.

### 7.3 Financiamento

Três vias de financiamento público são tecnicamente aplicáveis: (i) recursos do **Fundo Nacional de Calamidades Públicas, Proteção e Defesa Civil**, criado pela Lei nº 12.340/2010, destinado especificamente a ações de resposta a desastres; (ii) linhas de crédito para saneamento do **BNDES** e da **Caixa Econômica Federal**, hoje direcionadas a ETAs convencionais, mas que poderiam ser adaptadas para unidades modulares de resposta emergencial; (iii) emendas parlamentares de bancada estadual destinadas a saneamento e defesa civil, mecanismo já utilizado para aquisição de equipamentos de resposta a desastres pelos estados.

### 7.4 Fases de implementação propostas

Para que a ESTAS deixe de ser um protótipo conceitual e passe a operar como infraestrutura real, propõe-se a seguinte sequência: (1) **ensaio de bancada**, validando em laboratório as eficiências de remoção assumidas neste estudo para cada etapa, com água contaminada sintética e real; (2) **piloto em escala reduzida**, instalado em parceria com uma Defesa Civil estadual, operando por um ciclo de chuvas completo; (3) **licenciamento ambiental** junto ao órgão estadual de meio ambiente, incluindo o descarte dos resíduos concentrados (lodo metálico, biossurfactante saturado); (4) **produção em série** de unidades modulares padronizadas, permitindo economia de escala no CAPEX estimado na Seção 4; (5) **estocagem estratégica** em bases regionais da Defesa Civil, análoga ao estoque atual de kits de emergência, para deploy em até 72 horas após a decretação de calamidade.

## 8 LIMITAÇÕES DO ESTUDO

As eficiências de remoção por etapa (Seção 3) são estimativas didáticas, coerentes com a ordem de grandeza relatada na literatura de cada mecanismo, mas não resultam de ensaio de bancada da ESTAS. Os custos de equipamento e obra civil (Seção 4) são estimativas de mercado, não cotação de fornecedor nem orçamento de engenharia. A intensidade de lâmpada UV-C assumida (8 mW/cm²) é uma premissa de projeto plausível, não uma especificação de equipamento selecionado. Este estudo não substitui projeto executivo de engenharia sanitária, ensaio laboratorial de eficiência de remoção, nem licenciamento ambiental — etapas indispensáveis antes de qualquer implantação real.

## 9 CONCLUSÃO

A ESTAS se mostra tecnicamente viável como unidade modular de resposta emergencial: o memorial de cálculo hidráulico demonstra dimensionamento factível para as três faixas de vazão avaliadas, com custo por metro cúbico da mesma ordem de grandeza de uma ETA convencional no cenário de maior vazão (enchente urbana). O caminho institucional para sua adoção pelo poder público já existe no arranjo legal brasileiro vigente (Lei nº 12.608/2012, Lei nº 14.026/2020, Lei nº 14.133/2021), faltando o investimento em ensaio de bancada, piloto e produção em série descritos na Seção 7.4. O maior obstáculo não é tecnológico, mas de **prioridade orçamentária e institucional**: nenhuma linha de financiamento federal é hoje dedicada especificamente a unidades modulares de tratamento de água pós-desastre, ainda que o arcabouço legal para criá-la já exista.

---

## REFERÊNCIAS

AGÊNCIA SENADO. **Estudo aponta que falta de saneamento prejudica mais de 130 milhões de brasileiros**. 2022. Disponível em: <https://www12.senado.leg.br/noticias/infomaterias/2022/03/estudo-aponta-que-falta-de-saneamento-prejudica-mais-de-130-milhoes-de-brasileiros>. Acesso em: 7 ago. 2026.

AQUAMEC. **O que é uma ETA? Conheça o papel das Estações de Tratamento de Água no saneamento**. 2019. Disponível em: <https://aquamecbrasil.com.br/o-que-e-uma-eta-conheca-o-papel-das-estacoes-de-tratamento-de-agua-no-saneamento/>. Acesso em: 11 ago. 2026.

BRASIL. **Lei nº 11.445, de 5 de janeiro de 2007**. Estabelece as diretrizes nacionais para o saneamento básico. Brasília, DF: Presidência da República, 2007.

BRASIL. **Lei nº 12.340, de 1º de dezembro de 2010**. Dispõe sobre o Sistema Nacional de Defesa Civil e sobre o Fundo Especial para Calamidades Públicas. Brasília, DF: Presidência da República, 2010.

BRASIL. **Lei nº 12.608, de 10 de abril de 2012**. Institui a Política Nacional de Proteção e Defesa Civil (PNPDEC). Brasília, DF: Presidência da República, 2012.

BRASIL. **Lei nº 14.026, de 15 de julho de 2020**. Atualiza o marco legal do saneamento básico. Brasília, DF: Presidência da República, 2020.

BRASIL. **Lei nº 14.133, de 1º de abril de 2021**. Lei de Licitações e Contratos Administrativos. Brasília, DF: Presidência da República, 2021.

BRASIL. Ministério da Saúde. **Portaria GM/MS nº 888, de 4 de maio de 2021**. Altera o Anexo XX da Portaria de Consolidação GM/MS nº 5/2017, referente aos procedimentos de controle e vigilância da qualidade da água para consumo humano. Diário Oficial da União, Brasília, DF, 2021.

CEMADEN. **Estado do clima: extremos de clima e desastres no Brasil — 2025**. Ministério da Ciência, Tecnologia e Inovação, 2026. Disponível em: <https://www.gov.br/cemaden>. Acesso em: 7 ago. 2026.

LARANJEIRA, Mauro C. M.; FÁVERE, Valfredo T. de. Quitosana: biopolímero funcional com potencial industrial biomédico. **Química Nova**, v. 32, n. 3, p. 672–678, 2009.

NITSCHKE, Marcia; PASTORE, Gláucia Maria. Biossurfactantes: propriedades e aplicações. **Química Nova**, 2002.

SPHERE ASSOCIATION. **The Sphere Handbook: Humanitarian Charter and Minimum Standards in Humanitarian Response**. 4. ed. Genebra: Sphere Association, 2018.

WORLD HEALTH ORGANIZATION (WHO). **Guidelines for drinking-water quality**. 4. ed. incorporating the first and second addenda. Genebra: WHO, 2022.

ZHANG, Xi-Feng et al. Silver Nanoparticles: Synthesis, Characterization, Properties, Applications, and Therapeutic Approaches. **International Journal of Molecular Sciences**, v. 17, n. 9, p. 1534, 2016.
