import { useStationStore } from '../state/store';
import { UV_MIN_DOSE_MJ_CM2 } from '../data/waterQualityStandards';

/**
 * Manual do app em uma tela: o que cada elemento da estação representa, o que cada controle faz
 * e — o ponto central da apresentação — COMO o tratamento realmente remove cada contaminante.
 */
export function HowItWorksModal() {
  const open = useStationStore((s) => s.howOpen);
  const setOpen = useStationStore((s) => s.setHowOpen);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal glass" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="modal-close" onClick={() => setOpen(false)} aria-label="Fechar">
          ×
        </button>

        <p className="modal-eyebrow">Guia da demonstração</p>
        <h2>Como ler a estação e como o tratamento funciona</h2>

        <div className="how-grid">
          <section className="how-card">
            <h3>1. O que você está vendo</h3>
            <ul className="how-list">
              <li><strong>A calha em terraços</strong> é um corte da ESTAS encaixada numa encosta: a água entra no topo e desce por gravidade até o reservatório na base.</li>
              <li><strong>Cada terraço é um módulo fechado</strong> por padrão — como a estação apareceria de verdade. Clique em um módulo e use o botão "Abrir módulo" para ver os componentes internos.</li>
              <li><strong>A fita azul</strong> é a água fluindo: a cor muda de trecho a trecho conforme a turbidez real medida naquele ponto — ela entra barrenta e sai clara.</li>
              <li><strong>Triângulos de alerta</strong> marcam módulos onde algum parâmetro monitorado ainda está fora do padrão de potabilidade para o cenário ativo.</li>
              <li><strong>Torre com chaminé</strong> (Etapa III) é a torre de desgaseificação em cascata; <strong>tubos roxos</strong> (Etapa IV) são as câmaras de UV-C.</li>
            </ul>
          </section>

          <section className="how-card">
            <h3>2. O que cada controle faz</h3>
            <ul className="how-list">
              <li><strong>Camada da água</strong> — troca o que é pintado sobre a estação: <em>Estação</em> (visão fechada), <em>Turbidez</em>, <em>Metais pesados</em>, <em>Patógenos</em> e <em>pH</em>.</li>
              <li><strong>Chuva comum / Enchente urbana / Rejeito de mineração</strong> — muda a origem e a composição da água bruta que entra na estação.</li>
              <li><strong>Linha do tempo</strong> — desliza da água bruta (0) até depois da Etapa VII (7) e mostra a % de conformidade com a Portaria GM/MS 888/2021 em cada ponto.</li>
              <li><strong>Clique em um módulo</strong> — abre o diagnóstico daquele ponto: leituras, alertas e o cálculo de vazão da etapa.</li>
              <li><strong>Girar / Recentrar / Só a estação</strong> — controlam a câmera e escondem os painéis para apresentar.</li>
            </ul>
          </section>

          <section className="how-card highlight">
            <h3>3. Como a biossorção remove metais pesados</h3>
            <p>
              Biossurfactantes são moléculas que têm uma parte que se mistura com água e outra que se liga a
              metais — como uma pinça molecular. Eles não removem metal instantaneamente: dependem de dois
              fatores que se multiplicam.
            </p>
            <ol className="how-steps">
              <li><strong>Tempo de contato.</strong> A complexação metal-biossurfactante precisa de cerca de 30 minutos para se completar — menos que isso, a reação fica pela metade.</li>
              <li><strong>Capacidade disponível.</strong> Cada painel de biossorção tem um limite de quanto metal consegue reter; água muito carregada (como a de rejeito de mineração) satura essa capacidade mais rápido.</li>
              <li><strong>Multiplica os dois.</strong> Tempo suficiente sem capacidade disponível não remove nada, e vice-versa — por isso o modelo multiplica, não soma.</li>
            </ol>
            <p className="how-note">
              Por que isso importa: é o motivo pelo qual o cenário de rejeito de mineração pede mais tempo de
              contato (mais tanques em série) do que o cenário de enchente urbana, mesmo os dois passando
              pelo mesmo módulo.
            </p>
          </section>

          <section className="how-card highlight">
            <h3>4. Por que os 3 cenários estão aqui — e o que muda em cada um</h3>
            <p>
              A ESTAS é pensada como unidade móvel, para ser instalada onde um desastre acontece — não uma
              característica fixa de um único lugar.
            </p>
            <ul className="how-list">
              <li>
                <strong>Enchente urbana</strong> — baseada nas enchentes do Rio Grande do Sul (maio de 2024):
                esgoto misturado, sedimento e carga biológica alta. <em>A estação prioriza a filtração inicial
                e estende o tempo de contato para dar conta da carga biológica.</em>
              </li>
              <li>
                <strong>Rejeito de mineração</strong> — baseada em Brumadinho (2019), Mariana (2015) e no
                garimpo ilegal na Amazônia: metais pesados (mercúrio, chumbo, cádmio) em concentração alta e
                pH ácido. <em>A estação reforça a biossorção e usa a remineralização para corrigir o pH.</em>
              </li>
              <li>
                <strong>Chuva comum</strong> — linha de base sem evento de desastre, para comparar o ganho de
                tratar água de calamidade contra uma operação de rotina.
              </li>
            </ul>
            <p className="how-note">
              Sem essa diferenciação, uma estação dimensionada só para chuva comum falharia justamente no
              momento em que mais se precisa dela — depois de um desastre real.
            </p>
          </section>

          <section className="how-card">
            <h3>5. Como a desinfecção UV-C é calculada</h3>
            <p>
              A dose mínima exigida pela Portaria GM/MS nº 888/2021 é <strong>{UV_MIN_DOSE_MJ_CM2} mJ/cm²</strong>,
              na faixa germicida de 200 a 280 nm. A fórmula é simples: <strong>Dose = Intensidade × Tempo de
              exposição</strong>. Só que turbidez alta absorve parte da luz antes dela atingir o microrganismo —
              por isso essa etapa só é plenamente eficaz depois que a água já passou pela filtração e pela
              biossorção.
            </p>
          </section>

          <section className="how-card">
            <h3>6. Até onde este modelo vai (e onde para)</h3>
            <ul className="how-list">
              <li>O ambiente é <strong>simulado</strong>: as concentrações de entrada são estimativas didáticas, calibradas pela ordem de grandeza dos desastres citados — não são medições de campo.</li>
              <li>As eficiências de remoção por etapa são <strong>coerentes com a literatura</strong> de cada mecanismo, mas não resultam de ensaio de bancada da ESTAS.</li>
              <li>Os valores de custo (CAPEX/OPEX) são <strong>ordem de grandeza</strong>, não orçamento de engenharia.</li>
              <li>Uma unidade real precisaria de ensaio piloto, validação laboratorial de cada etapa e licenciamento ambiental antes de operar.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
