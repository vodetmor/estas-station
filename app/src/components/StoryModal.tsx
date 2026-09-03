import { useStationStore } from '../state/store';
import { CONTAMINATION_SCENARIOS } from '../data/contaminationScenarios';
import { computeStationImpact, formatInt } from '../logic/impactModel';

/**
 * A tese do projeto em uma tela: por que tratar água supercontaminada de desastre é uma questão
 * de moradia e dignidade, não só de engenharia — e as metas de ODS 6 que o trabalho endereça.
 */
export function StoryModal() {
  const open = useStationStore((s) => s.storyOpen);
  const setStoryOpen = useStationStore((s) => s.setStoryOpen);
  const scenario = useStationStore((s) => s.scenario);
  const impact = computeStationImpact(CONTAMINATION_SCENARIOS[scenario]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => setStoryOpen(false)}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={() => setStoryOpen(false)} aria-label="Fechar">
          ×
        </button>

        <p className="modal-eyebrow">Desafio Tech La Salle 2026 · Equipe SobraQuark · Colégio La Salle Sobradinho</p>
        <h2>Quase 35 milhões de brasileiros vivem sem água tratada — e um desastre pode deixar essa conta ainda pior</h2>

        <p className="modal-lead">
          Em 2022, cerca de 35 milhões de pessoas no Brasil não tinham acesso à água tratada e 100 milhões
          não tinham coleta de esgoto (Agência Senado, 2022). Quando uma enchente ou o rompimento de uma
          barragem de rejeito acontece, essa rede já frágil colapsa: a água que sobra vem misturada com
          esgoto, lama e metais pesados — e as Estações de Tratamento convencionais não foram projetadas
          para lidar com esse nível de contaminação.
        </p>

        <p className="modal-lead">
          A ESTAS é uma resposta modular a esse vazio: uma unidade setorizada, instalável em terraços numa
          encosta, que trata água supercontaminada em 7 etapas — da filtração física à desinfecção UV-C —
          usando biossurfactantes e quitosana para capturar o que uma ETA comum não consegue. Moradia digna
          inclui água potável; sem ela, não existe segurança nem saúde possível numa comunidade atingida.
        </p>

        <div className="ods-grid">
          <article className="ods-card" data-ods="6">
            <header>
              <span className="ods-badge" data-ods="6">ODS 6</span>
              <h3>Acesso e qualidade da água</h3>
            </header>
            <p>
              <strong>Meta 6.1</strong> — até 2030, alcançar o acesso universal e equitativo à água potável
              e segura para todos.
            </p>
            <p>
              <strong>Meta 6.3</strong> — melhorar a qualidade da água, reduzindo a poluição e eliminando o
              despejo de contaminantes perigosos.
            </p>
            <p className="ods-link">
              No app: neste cenário, a estação trata{' '}
              <strong>{impact.treatedM3PerDay.toFixed(0)} m³/dia</strong> de água supercontaminada até o
              padrão de potabilidade — o suficiente para{' '}
              <strong>{formatInt(impact.peopleServedEmergency)} pessoas</strong> no padrão humanitário de
              emergência (15 L/pessoa/dia).
            </p>
          </article>

          <article className="ods-card" data-ods="6">
            <header>
              <span className="ods-badge" data-ods="6">ODS 6</span>
              <h3>Gestão e eficiência dos recursos</h3>
            </header>
            <p>
              <strong>Meta 6.4</strong> — aumentar substancialmente a eficiência do uso da água e garantir
              retiradas sustentáveis para reduzir a escassez.
            </p>
            <p>
              <strong>Meta 6.5</strong> — implementar a gestão integrada dos recursos hídricos em todos os
              níveis.
            </p>
            <p>
              <strong>Meta 6.b</strong> — apoiar e fortalecer a participação das comunidades locais na
              melhoria da gestão da água e do saneamento.
            </p>
            <p className="ods-link">
              No app: sendo modular e móvel, a mesma unidade pode ser realocada entre diferentes
              comunidades atingidas — em vez de uma infraestrutura fixa que só atende quem já tinha acesso.
            </p>
          </article>
        </div>

        <p className="modal-foot">
          Ambiente simulado com dados sintéticos calibrados por referências reais (Portaria GM/MS nº 888/2021,
          OMS, e os desastres citados nos cenários). Os valores servem para demonstrar o método — não são a
          medição de uma estação construída.
        </p>
      </div>
    </div>
  );
}
