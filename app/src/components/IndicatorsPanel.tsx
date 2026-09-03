import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from 'recharts';
import { STAGES } from '../data/stationData';
import { CONTAMINATION_SCENARIOS } from '../data/contaminationScenarios';
import { computeStageSeries } from '../logic/treatmentModel';
import { totalHeavyMetalLoad } from '../logic/waterQualityModel';
import { computeStationImpact, formatInt, formatBRL, STATION_PROFILE } from '../logic/impactModel';
import { useStationStore } from '../state/store';

const TOOLTIP_STYLE = {
  background: '#1a1a19',
  border: '1px solid #383835',
  borderRadius: 8,
  fontSize: 12,
  color: '#ffffff',
};

export function IndicatorsPanel() {
  const scenario = useStationStore((s) => s.scenario);
  const stageIndex = useStationStore((s) => s.stageIndex);
  const setStageIndex = useStationStore((s) => s.setStageIndex);
  const profile = CONTAMINATION_SCENARIOS[scenario];
  const impact = computeStationImpact(profile);

  const series = useMemo(() => {
    return computeStageSeries(scenario, 7).map((r) => ({
      label: r.stageIndex === 0 ? 'Bruta' : `E${r.stageIndex}`,
      conformidade: Number(r.compliancePct.toFixed(1)),
      turbidezPct: Number(Math.min(100, (r.state.turbidez / 1000) * 100).toFixed(1)),
    }));
  }, [scenario]);

  const current = series[stageIndex];

  const costData = [
    {
      name: 'Custo por m³',
      'ESTAS (10 anos, CAPEX+OPEX)': Number(impact.costPerM3.toFixed(2)),
      'ETA convencional (referência)': impact.conventionalCostPerM3,
    },
  ];

  return (
    <div className="indicators">
      <section className="indicator-block">
        <h3>Água bruta — cenário {profile.label.toLowerCase()}</h3>
        <div className="scenario-brief" data-scenario={profile.id}>
          <span className="toast-tag">{profile.label}</span>
          <strong>{profile.headline}</strong>
          <p>{profile.description}</p>
          <p className="toast-action"><span>Ajuste operacional:</span> {profile.strategy}</p>
        </div>
        <div className="stat-grid">
          <Stat label="Vazão de entrada" value={`${profile.inflowLps.toFixed(1)} L/s`} hint="captação disponível" />
          <Stat label="pH bruto" value={profile.raw.pH.toFixed(1)} hint="ideal: 6,5–8,5" />
          <Stat label="Turbidez bruta" value={`${profile.raw.turbidez.toFixed(0)} uT`} hint="VMP: 5 uT" />
          <Stat
            label="Metais pesados"
            value={`${totalHeavyMetalLoad(profile.raw).toFixed(3)} mg/L`}
            hint="soma Pb+Hg+Cd+As+Cr"
            tone={totalHeavyMetalLoad(profile.raw) > 0.05 ? 'alert' : 'ok'}
          />
        </div>
        <p className="source-note">Fonte: {profile.source}</p>
      </section>

      <section className="indicator-block">
        <h3>Evolução da qualidade ao longo do tratamento</h3>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={series} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis dataKey="label" stroke="#898781" fontSize={11} />
            <YAxis stroke="#898781" fontSize={11} width={38} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#c3c2b7' }} />
            <Line type="monotone" dataKey="conformidade" name="Conformidade VMP (%)" stroke="#3ea8cf" strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="turbidezPct" name="Turbidez relativa (%)" stroke="#d95926" strokeWidth={2} dot={{ r: 2.5 }} isAnimationActive={false} />
            <ReferenceDot x={current.label} y={current.conformidade} r={6} fill="#3ecf8e" stroke="#0d0d0d" />
          </LineChart>
        </ResponsiveContainer>
        <div className="mini-ticks">
          <button type="button" data-active={stageIndex === 0} onClick={() => setStageIndex(0)}>bruta</button>
          {STAGES.map((s) => (
            <button key={s.id} type="button" data-active={stageIndex === s.order} onClick={() => setStageIndex(s.order)}>
              {s.order}
            </button>
          ))}
        </div>
      </section>

      <section className="indicator-block">
        <h3>Custo por m³ tratado</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={costData} margin={{ top: 6, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="#2c2c2a" vertical={false} />
            <XAxis dataKey="name" stroke="#898781" fontSize={11} tick={false} />
            <YAxis stroke="#898781" fontSize={11} width={38} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#c3c2b7' }} />
            <Bar dataKey="ESTAS (10 anos, CAPEX+OPEX)" fill="#3ea8cf" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ETA convencional (referência)" fill="#7fae63" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="source-note">
          Estimativa de ordem de grandeza (elaboração própria), amortizando CAPEX + OPEX por 10 anos de operação
          contínua. Não é orçamento de engenharia.
        </p>
      </section>

      <section className="indicator-block impact">
        <h3>O que isso significa em abastecimento</h3>
        <div className="stat-grid">
          <Stat label="Água tratada / dia" value={`${impact.treatedM3PerDay.toFixed(0)} m³`} hint={`vazão de saída ${impact.outflowLps.toFixed(1)} L/s`} tone="good" />
          <Stat label="Pessoas atendidas (emergência)" value={formatInt(impact.peopleServedEmergency)} hint={`${STATION_PROFILE.emergencyLitersPerPersonDay} L/pessoa/dia — padrão Sphere`} tone="good" />
          <Stat label="Pessoas atendidas (rotina)" value={formatInt(impact.peopleServedRoutine)} hint={`${STATION_PROFILE.routineLitersPerPersonDay} L/pessoa/dia — consumo doméstico`} />
          <Stat label="Investimento estimado (CAPEX)" value={formatBRL(impact.totalCapex)} hint="obra civil + equipamentos, ordem de grandeza" />
        </div>
        <p className="source-note">
          Padrão humanitário de emergência: 15 L/pessoa/dia (Sphere Handbook, 2018). Consumo doméstico de
          rotina: ~110 L/pessoa/dia (referência setorial brasileira). CAPEX e custo por m³ são estimativas
          didáticas com premissas declaradas em código, não cotação de mercado.
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'good' | 'warn' | 'alert' | 'ok';
}) {
  return (
    <div className="stat-tile" data-tone={tone}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}
