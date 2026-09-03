// Perfis de água BRUTA (antes de qualquer tratamento) para 3 cenários de origem — o equivalente,
// em ESTAS, ao que climateScenarios.ts era no app da fazenda: o "input" que a simulação processa.
//
// A ESTAS é pensada como unidade MODULAR e MÓVEL (o próprio projeto a descreve como "alternativa
// viável para o abastecimento em situações de calamidade"), então cada cenário representa a
// unidade sendo instalada em um desastre real diferente — não uma característica fixa de um único
// lugar. As concentrações são estimativas didáticas (não há boletim público com números fechados
// de "mg/L de mercúrio no dia X"), mas a DIREÇÃO e a ORDEM DE GRANDEZA são ancoradas em registros
// reais desses desastres, citados em cada cenário.

export type ScenarioId = 'chuva_comum' | 'enchente_urbana' | 'rejeito_mineracao';

export interface RawWaterProfile {
  pH: number;
  turbidez: number; // uT
  corAparente: number; // uH
  tds: number; // mg/L
  dureza: number; // mg/L
  eColiPresente: boolean;
  cianobacterias: number; // células/mL
  chumbo: number; // mg/L
  mercurio: number;
  cadmio: number;
  arsenio: number;
  cromo: number;
  cobre: number;
  niquel: number;
  bario: number;
  aluminio: number;
  ferro: number;
  manganes: number;
  cloreto: number;
  sulfato: number;
  amonia: number;
  sulfeto: number;
  /** Índice 0-100, proxy para carga de gases dissolvidos (CO2, H2S) que a torre de cascata precisa stripar. */
  gasesDissolvidos: number;
}

export interface ContaminationScenario {
  id: ScenarioId;
  label: string;
  headline: string;
  description: string;
  source: string;
  /** Vazão de água bruta disponível para captação nesse cenário, em L/s. */
  inflowLps: number;
  raw: RawWaterProfile;
  /** O que a estação faz de diferente (ajuste operacional) nesse cenário. */
  strategy: string;
}

export const CONTAMINATION_SCENARIOS: Record<ScenarioId, ContaminationScenario> = {
  chuva_comum: {
    id: 'chuva_comum',
    label: 'Chuva comum',
    headline: 'Água pluvial de referência — linha de base',
    description:
      'Escoamento superficial urbano após chuva comum, sem evento de desastre: sedimento leve, sem contaminação biológica ou química relevante. É o "controle" para comparar o ganho de tratar água de desastre.',
    source: 'Perfil de referência (linha de base didática)',
    inflowLps: 12,
    raw: {
      pH: 6.9, turbidez: 18, corAparente: 30, tds: 180, dureza: 90,
      eColiPresente: false, cianobacterias: 500,
      chumbo: 0.004, mercurio: 0.0002, cadmio: 0.0008, arsenio: 0.003, cromo: 0.01,
      cobre: 0.05, niquel: 0.01, bario: 0.05, aluminio: 0.15, ferro: 0.4, manganes: 0.05,
      cloreto: 40, sulfato: 30, amonia: 0.3, sulfeto: 0.01, gasesDissolvidos: 20,
    },
    strategy: 'Operação padrão: todas as 7 etapas em regime normal, sem necessidade de reforço.',
  },
  enchente_urbana: {
    id: 'enchente_urbana',
    label: 'Enchente urbana',
    headline: 'Água de enchente com esgoto misturado — Rio Grande do Sul, maio de 2024',
    description:
      'As enchentes do Rio Grande do Sul em maio de 2024 (bacia do Guaíba, mais de 2,3 milhões de pessoas afetadas segundo a Defesa Civil estadual) misturaram água pluvial com redes de esgoto rompidas, resíduos sólidos e sedimento urbano — o cenário mais citado no projeto original da ESTAS.',
    source: 'Defesa Civil do RS / CEMADEN (2024) — referência de escala do desastre, não medição direta de qualidade da água',
    inflowLps: 18,
    raw: {
      pH: 6.3, turbidez: 420, corAparente: 380, tds: 890, dureza: 210,
      eColiPresente: true, cianobacterias: 4200,
      chumbo: 0.018, mercurio: 0.0006, cadmio: 0.004, arsenio: 0.014, cromo: 0.04,
      cobre: 0.3, niquel: 0.05, bario: 0.2, aluminio: 0.6, ferro: 2.4, manganes: 0.4,
      cloreto: 180, sulfato: 210, amonia: 3.8, sulfeto: 0.22, gasesDissolvidos: 78,
    },
    strategy:
      'Prioriza a Etapa I (filtração/separação magnética) e amplia o tempo de contato na Etapa II para lidar com a carga biológica e o sedimento; ciclo de UV-C estendido pela alta turbidez inicial.',
  },
  rejeito_mineracao: {
    id: 'rejeito_mineracao',
    label: 'Rejeito de mineração',
    headline: 'Lama de rejeito com metais pesados — Brumadinho (2019) / Mariana (2015) / garimpo ilegal na Amazônia',
    description:
      'Rompimentos de barragens de rejeito de mineração de ferro — Brumadinho/MG (2019, Vale/Córrego do Feijão) e Mariana/MG (2015, Samarco/Fundão) — e o garimpo ilegal de ouro na Amazônia (uso de mercúrio na amalgamação, contaminando rios como o Tapajós) são as duas fontes reais de água supercontaminada por metais pesados que motivam esta etapa do projeto.',
    source: 'Relatórios públicos sobre os desastres de Brumadinho (2019) e Mariana (2015); estudos Fiocruz/WWF sobre mercúrio em bacias afetadas por garimpo ilegal na Amazônia',
    inflowLps: 9,
    raw: {
      pH: 5.4, turbidez: 980, corAparente: 520, tds: 1450, dureza: 340,
      eColiPresente: false, cianobacterias: 300,
      chumbo: 0.09, mercurio: 0.021, cadmio: 0.019, arsenio: 0.06, cromo: 0.14,
      cobre: 0.8, niquel: 0.18, bario: 0.9, aluminio: 1.4, ferro: 6.8, manganes: 1.1,
      cloreto: 90, sulfato: 340, amonia: 0.6, sulfeto: 0.04, gasesDissolvidos: 35,
    },
    strategy:
      'Reforça a Etapa II (biossorção): mais tempo de contato e mais painéis em série para dar conta da carga de metais pesados; a Etapa V (remineralização) precisa compensar o pH ácido antes de seguir.',
  },
};
