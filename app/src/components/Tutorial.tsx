import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useStationStore } from '../state/store';

/**
 * Tutorial guiado em spotlight: escurece a tela inteira, recorta o elemento da vez e
 * explica o que ele faz. É o ÚNICO popup do app — o resto da interface fica limpa e
 * só aparece quando a pessoa pede.
 */
interface Step {
  selector: string | null; // null = destaca a estação (centro da tela)
  title: string;
  body: string;
  padding?: number;
}

const STEPS: Step[] = [
  {
    selector: null,
    title: 'Esta é a ESTAS',
    body: 'Uma unidade modular de tratamento em terraços, encaixada numa encosta. Arraste para girar, pince ou role para aproximar — e toque em qualquer módulo para abrir o diagnóstico.',
  },
  {
    selector: '.layer-dock',
    title: 'Camadas da água',
    body: 'Troque o que é pintado sobre a estação: a visão fechada, a turbidez, os metais pesados, a carga de patógenos e o pH.',
  },
  {
    selector: '.scenario-switch',
    title: 'Origem da água bruta',
    body: 'Chuva comum, enchente urbana ou rejeito de mineração. Cada origem muda a contaminação de entrada — e a estação reage na hora.',
  },
  {
    selector: '.timeline',
    title: 'Linha do tempo do tratamento',
    body: 'Deslize da água bruta até depois da Etapa VII. Repare na conformidade ao lado: sobe conforme a água avança pelas 7 etapas.',
  },
  {
    selector: '.drawer-tab.details',
    title: 'Diagnóstico do módulo',
    body: 'Aqui aparecem as leituras do módulo escolhido, os alertas, o cálculo de vazão — e o botão para abrir o módulo e ver por dentro.',
  },
  {
    selector: '.drawer-tab.indicators',
    title: 'Indicadores e impacto',
    body: 'Água bruta do cenário, evolução da qualidade ao longo do tratamento, custo por m³ e quantas pessoas a estação consegue abastecer.',
  },
  {
    selector: '.info-actions',
    title: 'Contexto do projeto',
    body: '"Como funciona" explica o mecanismo de cada etapa. "ODS 6" mostra a tese: por que tratar água de desastre é uma questão de moradia e dignidade.',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function Tutorial() {
  const step = useStationStore((s) => s.tutorialStep);
  const setStep = useStationStore((s) => s.setTutorialStep);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = step !== null ? STEPS[step] : null;

  const measure = useCallback(() => {
    if (!current) return;
    if (!current.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(current.selector);
    if (!el) {
      setRect(null);
      return;
    }
    const pad = current.padding ?? 8;
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [current]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    if (step === null) return;
    window.addEventListener('resize', measure);
    const id = window.setTimeout(measure, 320);
    return () => {
      window.removeEventListener('resize', measure);
      window.clearTimeout(id);
    };
  }, [step, measure]);

  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStep(null);
      if (e.key === 'ArrowRight') setStep(step + 1 < STEPS.length ? step + 1 : null);
      if (e.key === 'ArrowLeft' && step > 0) setStep(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, setStep]);

  if (step === null || !current) return null;

  const isLast = step === STEPS.length - 1;
  const anchorBottom = rect ? rect.top > window.innerHeight * 0.45 : false;

  return (
    <div className="tutorial" role="dialog" aria-modal="true" data-hasspot={rect ? 'true' : 'false'}>
      <div className="tutorial-veil" onClick={() => setStep(null)} />
      {rect && (
        <div
          className="tutorial-spot"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      )}

      <div className="tutorial-card glass" data-anchor={anchorBottom ? 'top' : 'bottom'}>
        <button type="button" className="tutorial-close" onClick={() => setStep(null)} aria-label="Fechar tutorial">
          ×
        </button>
        <span className="tutorial-counter">Passo {step + 1} de {STEPS.length}</span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <p className="tutorial-credit">
          Aplicativo desenvolvido pela equipe SobraQuark, estudantes do <strong>Colégio La Salle Sobradinho</strong>
        </p>
        <div className="tutorial-actions">
          <button type="button" className="ghost-btn" onClick={() => setStep(null)}>
            Pular
          </button>
          <div className="tutorial-nav">
            {step > 0 && (
              <button type="button" className="ghost-btn" onClick={() => setStep(step - 1)}>
                Voltar
              </button>
            )}
            <button type="button" className="primary-btn" onClick={() => setStep(isLast ? null : step + 1)}>
              {isLast ? 'Explorar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
