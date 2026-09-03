import { useMemo } from 'react';
import { useStationStore } from '../state/store';
import { STAGES } from '../data/stationData';
import { resolveWaterQuality } from '../logic/treatmentModel';
import { generateAlerts, rankAlerts, explainBiosorption, explainUvDisinfection, totalHeavyMetalLoad } from '../logic/waterQualityModel';
import { UV_MIN_DOSE_MJ_CM2 } from '../data/waterQualityStandards';
import { computeStationHydraulics } from '../logic/impactModel';
import { CONTAMINATION_SCENARIOS } from '../data/contaminationScenarios';

/** Leituras do módulo selecionado, em blocos curtos e legíveis, sem parede de texto. */
export function StagePanel() {
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const scenario = useStationStore((s) => s.scenario);
  const setHowOpen = useStationStore((s) => s.setHowOpen);

  const stage = STAGES.find((s) => s.id === selectedStageId) ?? null;

  const result = useMemo(() => (stage ? resolveWaterQuality(scenario, stage.order) : null), [stage, scenario]);
  const topAlert = useMemo(() => {
    if (!result || !stage) return null;
    return rankAlerts(generateAlerts(result.state, stage))[0] ?? null;
  }, [result, stage]);

  const hydraulics = useMemo(() => {
    if (!stage) return null;
    const all = computeStationHydraulics(CONTAMINATION_SCENARIOS[scenario]);
    return all.find((h) => h.stage.id === stage.id) ?? null;
  }, [stage, scenario]);

  if (!stage || !result) {
    return (
      <div className="empty-block">
        <strong>Nenhum módulo selecionado</strong>
        <p>Toque em qualquer terraço da estação para ver as leituras daquele módulo e por que ele funciona assim.</p>
      </div>
    );
  }

  const { state, compliancePct } = result;
  const complianceTone = compliancePct >= 90 ? 'ok' : compliancePct >= 50 ? 'warn' : 'alert';

  return (
    <>
      <div className="metric-cards">
        <Card label="pH" value={state.pH.toFixed(1)} note="ideal: 6,5–8,5" />
        <Card label="Turbidez" value={`${state.turbidez.toFixed(0)} uT`} note="VMP: 5 uT" />
        <Card label="Metais pesados" value={`${totalHeavyMetalLoad(state).toFixed(3)} mg/L`} note="soma Pb+Hg+Cd+As+Cr" />
        <Card
          label="Conformidade"
          value={`${compliancePct.toFixed(0)}%`}
          tone={complianceTone}
          note="parâmetros dentro do VMP"
        />
      </div>

      {topAlert && (
        <div className="highlight-alert" data-severity={topAlert.severity}>
          <span className="severity-chip" data-severity={topAlert.severity}>{topAlert.severity}</span>
          <p className="highlight-action">{topAlert.message}</p>
        </div>
      )}

      {/* Bloco de Verificação Singular de Potabilidade do Módulo */}
      {stage.singularVerification && (
        <div className={`verification-gate-card ${stage.singularVerification.isFinalAudit ? 'final-audit' : ''}`}>
          <div className="gate-header">
            <span className="gate-badge">
              {stage.singularVerification.isFinalAudit ? '★ AUDITORIA FINAL INTEGRADA' : '● VERIFICAÇÃO SINGULAR DO MÓDULO'}
            </span>
            <h4>{stage.singularVerification.target}</h4>
          </div>
          <div className="gate-body">
            <div className="gate-row">
              <span className="gate-label">Sensor in-loco:</span>
              <span className="gate-val">{stage.singularVerification.sensor}</span>
            </div>
            <div className="gate-row">
              <span className="gate-label">Critério de aprovação:</span>
              <span className="gate-val">{stage.singularVerification.criterion}</span>
            </div>
          </div>
          <div className="gate-footer">
            {stage.singularVerification.isFinalAudit ? (
              <span>✓ Atestado multiparâmetro de potabilidade (Portaria GM/MS nº 888/2021) antes da liberação final ao reservatório.</span>
            ) : (
              <span>→ Cada módulo executa sua verificação singular in-loco para atestar o tratamento específico antes do envio à próxima cota.</span>
            )}
          </div>
        </div>
      )}

      {hydraulics && (
        <div className="hydraulics-block">
          <h3>Cálculo de vazão desta etapa</h3>
          <div className="hydraulics-row">
            <span>Vazão de entrada</span>
            <strong>{CONTAMINATION_SCENARIOS[scenario].inflowLps.toFixed(1)} L/s</strong>
          </div>
          <div className="hydraulics-row">
            <span>Tempo de retenção</span>
            <strong>{hydraulics.retentionMinutes.toFixed(hydraulics.retentionMinutes < 1 ? 2 : 0)} min</strong>
          </div>
          <div className="hydraulics-row">
            <span>Volume necessário (V = Q × t)</span>
            <strong>{hydraulics.volumeM3.toFixed(2)} m³</strong>
          </div>
        </div>
      )}

      {stage.id === 'biossorcao' ? (
        <BiosorptionReasoning retentionMinutes={hydraulics?.retentionMinutes ?? stage.retentionMinutes} state={state} onOpenHow={() => setHowOpen(true)} />
      ) : stage.id === 'desinfeccao' ? (
        <UvReasoning turbidez={state.turbidez} onOpenHow={() => setHowOpen(true)} />
      ) : (
        <div className="reasoning">
          <h3>Como esta etapa funciona</h3>
          <p className="mechanism-note">{stage.mechanism}</p>
          <p className="source-note">Fonte: {stage.source}</p>
        </div>
      )}
    </>
  );
}

function BiosorptionReasoning({
  retentionMinutes,
  state,
  onOpenHow,
}: {
  retentionMinutes: number;
  state: { chumbo: number; mercurio: number; cadmio: number; arsenio: number; cromo: number };
  onOpenHow: () => void;
}) {
  const totalLoad = state.chumbo + state.mercurio + state.cadmio + state.arsenio + state.cromo;
  const reason = explainBiosorption(retentionMinutes, totalLoad);
  return (
    <div className="reasoning">
      <h3>Por que essa remoção de metais</h3>
      <Factor label="Tempo de contato" score={reason.contactScore} note={reason.contactNote} />
      <Factor label="Capacidade dos painéis" score={reason.capacityScore} note={reason.capacityNote} />
      <p className="reasoning-formula">
        Os dois se <strong>multiplicam</strong>: sem tempo de contato suficiente, não importa a capacidade
        disponível — a complexação simplesmente não acontece.
      </p>
      <button type="button" className="link-btn" onClick={onOpenHow}>
        Entender o mecanismo →
      </button>
    </div>
  );
}

function UvReasoning({ turbidez, onOpenHow }: { turbidez: number; onOpenHow: () => void }) {
  const reason = explainUvDisinfection(UV_MIN_DOSE_MJ_CM2 * 1.1, UV_MIN_DOSE_MJ_CM2, turbidez);
  return (
    <div className="reasoning">
      <h3>Por que essa eficácia de desinfecção</h3>
      <Factor label="Dose UV-C aplicada" score={reason.doseScore} note={reason.doseNote} />
      <Factor label="Clareza da água" score={reason.clarityScore} note={reason.clarityNote} />
      <p className="reasoning-formula">
        Os dois se <strong>multiplicam</strong>: dose alta não basta se a turbidez ainda esconde os
        patógenos da luz.
      </p>
      <button type="button" className="link-btn" onClick={onOpenHow}>
        Entender o mecanismo →
      </button>
    </div>
  );
}

function Card({ label, value, note, tone = 'default' }: { label: string; value: string; note?: string; tone?: string }) {
  return (
    <div className="metric-card" data-tone={tone}>
      <span className="metric-card-label">{label}</span>
      <strong className="metric-card-value">{value}</strong>
      {note && <span className="metric-card-note">{note}</span>}
    </div>
  );
}

function Factor({ label, score, note }: { label: string; score: number; note: string }) {
  return (
    <div className="factor">
      <div className="factor-head">
        <span>{label}</span>
        <strong>{Math.round(score * 100)}%</strong>
      </div>
      <div className="factor-bar"><span style={{ width: `${score * 100}%` }} /></div>
      <p>{note}</p>
    </div>
  );
}
