import type { WaterState } from './treatmentModel';
import { complianceRows, type ComplianceRow } from './treatmentModel';
import { HEAVY_METAL_IDS } from '../data/waterQualityStandards';
import type { StageDef } from '../data/stationData';

// Explicabilidade: para as duas etapas com mecanismo genuinamente multiplicativo (biossorção de
// metais e desinfecção UV-C), devolve os 2 fatores que produzem o resultado — nunca um score
// sem mostrar o porquê. Para as demais etapas (mecanismo de fator único), uma nota explicativa
// simples já é suficiente e mais honesta do que forçar um produto de duas variáveis artificiais.

export type Severity = 'baixo' | 'moderado' | 'alto' | 'critico';

export interface BiosorptionExplanation {
  removalPct: number;
  contactScore: number; // 0-1: quão perto do tempo de contato ideal (30 min)
  contactNote: string;
  capacityScore: number; // 0-1: quanta capacidade de biossorção ainda resta (proxy: inverso da carga de metal)
  capacityNote: string;
}

const IDEAL_CONTACT_MIN = 30;

export function explainBiosorption(retentionMinutes: number, totalMetalLoadMgL: number): BiosorptionExplanation {
  const contactScore = Math.min(1, retentionMinutes / IDEAL_CONTACT_MIN);
  // Painel satura conforme a carga total de metais que precisa complexar é maior — quanto mais
  // carregada a água, menor a fração de capacidade disponível por litro tratado.
  const capacityScore = Math.max(0.15, Math.exp(-totalMetalLoadMgL / 0.15));
  const removalPct = contactScore * capacityScore * 100;

  return {
    removalPct,
    contactScore,
    contactNote:
      retentionMinutes >= IDEAL_CONTACT_MIN
        ? `${retentionMinutes} min de contato — tempo suficiente para a complexação metal-biossurfactante se completar (referência: ${IDEAL_CONTACT_MIN} min)`
        : `${retentionMinutes} min de contato — abaixo do tempo de referência de ${IDEAL_CONTACT_MIN} min, a complexação fica incompleta`,
    capacityScore,
    capacityNote:
      totalMetalLoadMgL > 0.3
        ? `carga de metais pesados de ${totalMetalLoadMgL.toFixed(3)} mg/L — alta, satura parte da capacidade dos painéis de biossorção`
        : `carga de metais pesados de ${totalMetalLoadMgL.toFixed(3)} mg/L — moderada, painéis operam com folga de capacidade`,
  };
}

export interface UvExplanation {
  removalPct: number;
  doseScore: number;
  doseNote: string;
  clarityScore: number;
  clarityNote: string;
}

export function explainUvDisinfection(doseMjCm2: number, minDoseMjCm2: number, turbidezUT: number): UvExplanation {
  const doseScore = Math.min(1, doseMjCm2 / minDoseMjCm2);
  // Turbidez alta espalha/absorve a luz UV antes de atingir os microrganismos.
  const clarityScore = Math.exp(-turbidezUT / 40);
  const removalPct = (1 - (1 - doseScore) * 0.5 - (1 - clarityScore) * 0.5) * 100;

  return {
    removalPct: Math.max(0, Math.min(100, removalPct)),
    doseScore,
    doseNote:
      doseMjCm2 >= minDoseMjCm2
        ? `dose aplicada ${doseMjCm2.toFixed(2)} mJ/cm² — atinge a dose mínima de ${minDoseMjCm2} mJ/cm² (Portaria GM/MS 888/2021)`
        : `dose aplicada ${doseMjCm2.toFixed(2)} mJ/cm² — abaixo do mínimo de ${minDoseMjCm2} mJ/cm² exigido pela norma`,
    clarityScore,
    clarityNote:
      turbidezUT > 5
        ? `turbidez de ${turbidezUT.toFixed(1)} uT ainda acima do VMP (5 uT) — parte da luz UV é bloqueada antes de atingir os patógenos`
        : `turbidez de ${turbidezUT.toFixed(1)} uT já dentro do VMP — a luz UV atinge os microrganismos sem obstrução relevante`,
  };
}

type MetalBearing = Record<'chumbo' | 'mercurio' | 'cadmio' | 'arsenio' | 'cromo', number>;

/** Aceita tanto WaterState (cascata) quanto RawWaterProfile (água bruta) — ambos têm os 5 metais. */
export function totalHeavyMetalLoad(state: MetalBearing): number {
  return HEAVY_METAL_IDS.reduce((sum, id) => sum + (state[id as keyof MetalBearing] as number), 0);
}

export interface Alert {
  paramId: string;
  severity: Severity;
  title: string;
  message: string;
  action: string;
}

function severityFor(ratio: number): Severity {
  if (ratio > 4) return 'critico';
  if (ratio > 1.5) return 'alto';
  if (ratio > 1) return 'moderado';
  return 'baixo';
}

/** Gera 1 alerta por parâmetro fora do VMP no ponto atual do tratamento. */
export function generateAlerts(state: WaterState, stage: StageDef | null): Alert[] {
  const rows = complianceRows(state);
  const alerts: Alert[] = [];

  for (const row of rows) {
    if (row.withinLimit) continue;
    const ratio = row.id === 'eColi' ? 5 : row.value / (Number(row.vmpLabel.replace(/[^\d.,]/g, '').replace(',', '.')) || 1);
    const severity = severityFor(Number.isFinite(ratio) ? ratio : 3);

    alerts.push({
      paramId: row.id,
      severity,
      title: `${row.label} fora do padrão de potabilidade`,
      message: `${row.label}: ${row.value.toFixed(row.value < 1 ? 3 : 1)} ${row.unit} — limite ${row.vmpLabel} ${row.unit} (${row.source}).`,
      action: stage
        ? `Segue para ${stage.label} — mecanismo: ${stage.mechanism}`
        : 'Ainda não passou por nenhuma etapa de tratamento.',
    });
  }
  return alerts;
}

const RANK: Record<Severity, number> = { critico: 3, alto: 2, moderado: 1, baixo: 0 };
export function rankAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => RANK[b.severity] - RANK[a.severity]);
}

export { complianceRows };
export type { ComplianceRow };
