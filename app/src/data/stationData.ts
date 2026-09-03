import type { ParamId } from './waterQualityStandards';

// As 7 etapas da ESTAS, na ordem em que a água realmente passa por elas (gravidade, de cima
// para baixo do terraço). `removal` é a FRAÇÃO removida do valor que a água já tinha ao chegar
// naquela etapa (não do valor bruto) — por isso o tratamento é modelado como uma cascata
// (reduce): cada etapa parte do resultado da anterior, exatamente como na estação real.
//
// Eficiências de remoção são estimativas didáticas coerentes com a ORDEM DE GRANDEZA relatada
// na literatura de cada mecanismo (citada em cada etapa) — não são resultado de ensaio de
// bancada. `retentionMinutes` vem do texto do projeto quando explícito (Etapa II = 30 min);
// as demais são dimensionadas por prática usual de engenharia sanitária para o tipo de unidade.

export type StageId =
  | 'filtracao'
  | 'biossorcao'
  | 'desgaseificacao'
  | 'desinfeccao'
  | 'remineralizacao'
  | 'monitoramento'
  | 'armazenamento';

export interface StageDef {
  id: StageId;
  order: number; // 1-7
  label: string;
  shortLabel: string;
  zone: 'topo' | 'reatores' | 'cascata' | 'polimento' | 'base'; // agrupamento visual (5 zonas da imagem de referência)
  description: string;
  mechanism: string;
  source: string;
  equipment: string;
  removal: Partial<Record<ParamId | 'gasesDissolvidos', number>>;
  /** Verificação singular de potabilidade específica do módulo */
  singularVerification: {
    target: string;
    sensor: string;
    criterion: string;
    isFinalAudit?: boolean;
  };
  /** Ajuste de pH: puxa o valor atual para `phTarget` por essa fração (0-1). */
  phPull?: { target: number; fraction: number };
  /** mg/L adicionados de sólidos dissolvidos (remineralização). */
  mineralBoostMgL?: number;
  retentionMinutes: number;
  /** Só a Etapa IV usa: dose exigida e intensidade assumida do banco de lâmpadas, para o cálculo de tempo de exposição. */
  uv?: { doseMjCm2: number; assumedIntensityMwCm2: number };
}

export const STAGES: StageDef[] = [
  {
    id: 'filtracao', order: 1, label: 'Etapa I — Filtração física e separação magnética', shortLabel: 'Filtração',
    zone: 'topo',
    description: 'Grades metálicas, peneiras de granulometria decrescente e leito filtrante de brita, areia quartzosa e antracito, seguidos de um canal com eletroímãs de alta intensidade.',
    mechanism: 'Remoção por barreira física (tamanho de partícula) e por atração magnética de partículas metálicas magnetizáveis — não afeta metais dissolvidos, só sólidos e frações particuladas.',
    singularVerification: {
      target: 'Separação Física e Retenção Magnética Efetuadas',
      sensor: 'Turbidímetro de feixe duplo e sensor indutivo magnético',
      criterion: 'Valida se 100% dos detritos grosseiros e frações ferromagnéticas particuladas foram removidos antes do envio aos reatores químicos.',
    },
    source: 'ESTAS §7.2',
    equipment: 'Grades · peneiras · leito de brita/areia/antracito · eletroímãs',
    removal: { turbidez: 0.85, corAparente: 0.6, tds: 0.15, ferro: 0.4, manganes: 0.1, aluminio: 0.2, eColi: 0.1, cianobacterias: 0.2 },
    retentionMinutes: 5,
  },
  {
    id: 'biossorcao', order: 2, label: 'Etapa II — Reatores de biossurfactantes e biossorção', shortLabel: 'Biossorção',
    zone: 'reatores',
    description: 'Tanques de reação com dosagem de biossurfactantes sob agitação lenta, seguidos de painéis de biossorção que retêm os complexos metal-biossurfactante formados.',
    mechanism: 'Os biossurfactantes são moléculas anfipáticas que complexam íons de metais pesados dissolvidos; a remoção depende do TEMPO DE CONTATO (mínimo prático cerca de 30 min) e da capacidade ainda livre nos painéis de biossorção — dois fatores que se multiplicam.',
    singularVerification: {
      target: 'Complexação Micelar e Remoção de Metais Pesados',
      sensor: 'Eletrodos íon-seletivos e voltametria anódica in-line',
      criterion: 'Valida se os íons tóxicos dissolvidos (Pb, Hg, Cd, As, Cr) foram quelados e retidos pelos painéis biológicos.',
    },
    source: 'ESTAS §6.1, §7.3 — NITSCHKE; PASTORE, 2002',
    equipment: 'Tanques de reação · agitadores lentos · dosador de biossurfactante · painéis de biossorção',
    removal: { chumbo: 0.85, mercurio: 0.8, cadmio: 0.85, arsenio: 0.75, cromo: 0.8, cobre: 0.7, niquel: 0.7, bario: 0.3, turbidez: 0.3, eColi: 0.3, amonia: 0.2 },
    retentionMinutes: 30,
  },
  {
    id: 'desgaseificacao', order: 3, label: 'Etapa III — Torres de desgaseificação em cascata', shortLabel: 'Desgaseificação',
    zone: 'cascata',
    description: 'Escoamento por sucessivos desníveis (efeito cascata), ampliando a interface água-atmosfera para liberar gases dissolvidos, captados por um sistema de exaustão filtrado.',
    mechanism: 'Transferência de massa gás-líquido: quanto maior a superfície de contato exposta (mais degraus, maior queda), mais CO2 e H2S dissolvidos escapam para a fase gasosa — e o pH sobe um pouco à medida que o CO2 dissolvido (ácido carbônico) sai da água.',
    singularVerification: {
      target: 'Desprendimento de Gases Sulfetados e Alívio de Acidez Volátil',
      sensor: 'Sonda eletroquímica de sulfeto dissolvido e analisador de pH contínuo',
      criterion: 'Valida se o gás sulfídrico (H2S) e CO2 em excesso foram liberados e evacuados pela exaustão forçada.',
    },
    source: 'ESTAS §7.4',
    equipment: 'Torre de aeração em cascata · dutos de ventilação · exaustão filtrada',
    removal: { sulfeto: 0.8, gasesDissolvidos: 0.9, turbidez: 0.05 },
    phPull: { target: 7.0, fraction: 0.25 },
    retentionMinutes: 3,
  },
  {
    id: 'desinfeccao', order: 4, label: 'Etapa IV — Desinfecção fotônica e polimento', shortLabel: 'Desinfecção UV-C',
    zone: 'polimento',
    description: 'Câmaras fechadas com lâmpadas UV-C (200-280 nm) seguidas de membranas cerâmicas revestidas de quitosana para microfiltração final.',
    mechanism: 'A radiação UV-C danifica o DNA/RNA de microrganismos; a eficácia depende da DOSE recebida (intensidade multiplicada pelo tempo de exposição, mínimo 1,5 mJ/cm² pela Portaria GM/MS 888/2021) e da CLAREZA da água — turbidez alta esconde patógenos da luz, por isso essa etapa só é plenamente eficaz depois da clarificação das etapas I e II.',
    singularVerification: {
      target: 'Inativação Germicida Fotônica e Barreira Microbiológica',
      sensor: 'Radiômetro espectral UV (254 nm) e sensor de transmitância UVT',
      criterion: 'Valida se a dose germicida letal mínima (1,5 mJ/cm²) foi entregue em 100% do volume, exterminando coliformes e cianobactérias.',
    },
    source: 'ESTAS §7.5 — Portaria GM/MS nº 888/2021',
    equipment: 'Câmaras UV-C · membranas cerâmicas com quitosana',
    removal: { eColi: 0.99, cianobacterias: 0.95, turbidez: 0.5, corAparente: 0.3, chumbo: 0.1, mercurio: 0.1, cadmio: 0.1, arsenio: 0.1, cromo: 0.1 },
    retentionMinutes: 0,
    uv: { doseMjCm2: 1.5, assumedIntensityMwCm2: 8 },
  },
  {
    id: 'remineralizacao', order: 5, label: 'Etapa V — Remineralização e estabilização físico-química', shortLabel: 'Remineralização',
    zone: 'base',
    description: 'Cartuchos com calcita e dolomita repõem cálcio, magnésio e outros sais essenciais; a água segue para um reservatório de estabilização.',
    mechanism: 'Água puramente filtrada/desinfetada fica "agressiva" (baixa mineralização, pH instável) — os cartuchos dissolvem minerais controladamente até a faixa de referência (Ca 10 a 150 mg/L, Na abaixo de 30-50 mg/L, Mg 0 a 50 mg/L).',
    singularVerification: {
      target: 'Equilíbrio Iônico, Dureza e Não-Agressividade da Água',
      sensor: 'Sonda condutimétrica toroidal e eletrodo de pH compensado',
      criterion: 'Valida se os teores de Ca²+ e Mg²+ foram repostos na faixa saudável e se o pH estabilizou entre 6,5 e 8,5.',
    },
    source: 'ESTAS §7.6 — Portaria GM/MS nº 888/2021',
    equipment: 'Cartuchos de calcita/dolomita · reservatório de estabilização',
    removal: { dureza: 0.1 },
    phPull: { target: 7.2, fraction: 0.9 },
    mineralBoostMgL: 15,
    retentionMinutes: 10,
  },
  {
    id: 'monitoramento', order: 6, label: 'Etapa VI — Estação de Verificação Final Multiparâmetro', shortLabel: 'Verificação Geral',
    zone: 'base',
    description: 'Bancada central de auditoria com sensores multiparâmetros redundantes e telemetria, atestando a potabilidade integral antes da entrega pública.',
    mechanism: 'Não é uma etapa de remoção — é a estação de controle e checagem final que integra e audita todos os parâmetros da Portaria GM/MS 888/2021, confirmando se toda a cadeia operou com perfeição.',
    singularVerification: {
      target: 'AUDITORIA FINAL DE POTABILIDADE E CONFORMIDADE PORTARIA 888',
      sensor: 'Controlador lógico multiparâmetro (turbidez, pH, condutividade, metais, patógenos, cloro)',
      criterion: 'Auditoria cruzada e certificação de 100% dos parâmetros de potabilidade. Se qualquer parâmetro desviar, a válvula de distribuição fecha automaticamente.',
      isFinalAudit: true,
    },
    source: 'ESTAS §7.7 — Portaria GM/MS nº 888/2021',
    equipment: 'Sensores de pH/turbidez/temperatura/condutividade/TDS/vazão/nível · controlador eletrônico',
    removal: {},
    retentionMinutes: 1,
  },
  {
    id: 'armazenamento', order: 7, label: 'Etapa VII — Armazenamento e distribuição pública', shortLabel: 'Distribuição',
    zone: 'base',
    description: 'Reservatório final de água potável, protegido contra contaminação externa, com tubulações e válvulas para abastecimento comunitário.',
    mechanism: 'Decantação residual de traços de sólidos em suspensão durante o tempo de detenção no reservatório antes da distribuição.',
    singularVerification: {
      target: 'Pressão Hidrostática, Desinfecção Residual e Vazão Contínua',
      sensor: 'Sensor de nível piezométrico e medidor ultrassônico de vazão',
      criterion: 'Valida a preservação da água potável e a disponibilidade de 360.000 L/h para distribuição pública segura.',
    },
    source: 'ESTAS §7.8',
    equipment: 'Reservatório de água potável · tubulações · válvulas de controle de vazão',
    removal: { turbidez: 0.05 },
    retentionMinutes: 120,
  },
];

export const STAGE_ZONES: Record<StageDef['zone'], { label: string; order: number }> = {
  topo: { label: 'Fase 1 — Filtração e magnetismo', order: 1 },
  reatores: { label: 'Fase 2 — Casa do biossurfactante', order: 2 },
  cascata: { label: 'Fase 3 — Torre de desgaseificação', order: 3 },
  polimento: { label: 'Fase 4 — Desinfecção fotônica', order: 4 },
  base: { label: 'Fase 5 — Remineralização, controle e distribuição', order: 5 },
};
