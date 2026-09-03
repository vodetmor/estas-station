# ESTAS — Estação Setorizada de Tratamento de Águas Supercontaminadas

Maquete 3D interativa da estação, para a Mostra/Desafio Tech La Salle 2026 — Equipe SobraQuark,
Colégio La Salle Sobradinho.

Recicla a arquitetura e os padrões de UX validados no primeiro app da equipe (AgroSentinela IA):
maquete 3D full-bleed, painéis de vidro flutuantes, tutorial guiado em spotlight, explicabilidade
por fatores, linha do tempo interativa — adaptados aqui para um corte técnico em terraços numa
encosta, com os módulos de tratamento fechados por padrão e abertos sob interação do usuário.

## O que dá para fazer no app

- **Explorar a estação em corte isométrico**: 7 módulos em terraços, do topo (água bruta) à base
  (reservatório de água potável), ligados por uma fita d'água que muda de cor conforme a turbidez
  real cai a cada etapa.
- **Abrir/fechar cada módulo**: por padrão os módulos aparecem fechados (como a estação real); um
  clique abre o módulo e revela os componentes internos (tanques, painéis de biossorção, câmaras
  UV-C, cartuchos de remineralização etc.).
- **Trocar a origem da água bruta**: chuva comum, enchente urbana (RS, 2024) ou rejeito de
  mineração (Brumadinho 2019 / Mariana 2015 / garimpo ilegal na Amazônia).
- **Avançar a linha do tempo do tratamento**: da água bruta até depois da Etapa VII, acompanhando
  a % de conformidade com a Portaria GM/MS nº 888/2021 subir a cada etapa.
- **Ver o cálculo de vazão de cada módulo**: volume necessário (V = Q × t), tempo de retenção e o
  custo civil estimado.

## Documentos do projeto

- `Estudo de Viabilidade.md` / `.docx` / `.pdf` — estudo de viabilidade técnica, econômica e de
  implementação real (padrão ABNT), com memorial de cálculo hidráulico, estimativa de custo e
  proposta de caminho institucional para adoção pelo poder público.
- `ESTAS - versão 3 - 12_08.md` — projeto de pesquisa original (Desafio Tech La Salle 2026).

## Stack

React + TypeScript + Vite · three.js / react-three-fiber (maquete 3D) · Recharts (gráficos) ·
Zustand (estado). Terreno, degraus e módulos são gerados proceduralmente em código.

## Rodando localmente

```bash
cd app
npm install
npm run dev
```
