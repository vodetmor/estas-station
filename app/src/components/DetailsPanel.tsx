import { useState } from 'react';
import { useStationStore } from '../state/store';
import { STAGES } from '../data/stationData';
import { StagePanel } from './StagePanel';
import { AlertFeed } from './AlertFeed';

/**
 * Painel único de diagnóstico, dividido em duas abas — mesmo padrão do app da fazenda: no
 * celular, módulo + alertas empilhados viravam rolagem infinita ilegível.
 */
export function DetailsPanel() {
  const [tab, setTab] = useState<'modulo' | 'alertas'>('modulo');
  const selectedStageId = useStationStore((s) => s.selectedStageId);
  const toggleDetails = useStationStore((s) => s.toggleDetails);
  const selectStage = useStationStore((s) => s.selectStage);
  const toggleOpen = useStationStore((s) => s.toggleStageOpen);
  const openStages = useStationStore((s) => s.openStages);
  const stage = STAGES.find((s) => s.id === selectedStageId) ?? null;
  const isOpen = stage ? openStages.has(stage.id) : false;

  const handleClose = () => {
    toggleDetails();
    selectStage(null);
  };

  return (
    <div className="panel-shell">
      <div className="mobile-sheet-handle" onClick={handleClose} title="Fechar painel" />
      <header className="panel-header">
        <div>
          <h2>{stage ? stage.shortLabel : 'Diagnóstico'}</h2>
          <p>{stage ? `Etapa ${stage.order} de 7 · ${stage.equipment}` : 'Toque em qualquer módulo da estação'}</p>
        </div>
        <button type="button" className="panel-close" onClick={handleClose} aria-label="Fechar painel">
          ×
        </button>
      </header>

      {stage && (
        <button type="button" className="open-module-btn" onClick={() => toggleOpen(stage.id)}>
          {isOpen ? '◧ Fechar módulo (voltar à casca externa)' : '◨ Abrir módulo (ver por dentro)'}
        </button>
      )}

      <div className="panel-tabs" role="tablist">
        <button type="button" role="tab" data-active={tab === 'modulo'} onClick={() => setTab('modulo')}>
          Módulo
        </button>
        <button type="button" role="tab" data-active={tab === 'alertas'} onClick={() => setTab('alertas')}>
          Alertas
        </button>
      </div>

      <div className="panel-scroll">{tab === 'modulo' ? <StagePanel /> : <AlertFeed />}</div>
    </div>
  );
}
