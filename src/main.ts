import './styles.css';
import { calculatePlan } from './domain/planner';
import { createPlanSvg } from './domain/svg';
import type { PlanInput, Point } from './domain/types';

const defaults: PlanInput = {
  siteWidth: 20,
  siteDepth: 30,
  frontageWidth: 10,
  roadWidth: 6,
  designatedBcr: 60,
  designatedFar: 200,
  roadFarCoefficient: 0.4,
  maxHeight: 20,
  floorHeight: 3,
  frontSetback: 2,
  rearSetback: 1,
  sideSetback: 1,
  commonAreaRatio: 20,
  targetUnitArea: 35,
  corridorWidth: 1.2,
  stairWidth: 0.9,
  stairRise: 0.2,
  stairTread: 0.24
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root was not found.');

const field = (name: keyof PlanInput, label: string, step = '0.1', suffix = ''): string => `
  <label>
    <span>${label}</span>
    <div class="input-wrap"><input name="${name}" type="number" step="${step}" value="${String(defaults[name])}" required /><b>${suffix}</b></div>
  </label>`;

app.innerHTML = `
  <header class="hero">
    <div>
      <p class="eyebrow">EARLY-STAGE FEASIBILITY TOOL</p>
      <h1>Apartment Volume Planner <em>JP</em></h1>
      <p>敷地・道路・建ぺい率・容積率・高さ・共用部条件から、共同住宅の概算ボリュームと平面たたき台を即時計算します。</p>
    </div>
    <div class="hero-badge">概算検討用<br><strong>確認申請非代替</strong></div>
  </header>
  <main>
    <form id="planner-form" class="panel form-panel">
      <div class="section-title"><span>01</span><h2>敷地・都市計画</h2></div>
      <div class="grid">
        ${field('siteWidth', '敷地幅', '0.1', 'm')}
        ${field('siteDepth', '敷地奥行', '0.1', 'm')}
        ${field('frontageWidth', '接道長さ', '0.1', 'm')}
        ${field('roadWidth', '前面道路幅員', '0.1', 'm')}
        ${field('designatedBcr', '指定建ぺい率', '1', '%')}
        ${field('designatedFar', '指定容積率', '1', '%')}
        ${field('roadFarCoefficient', '道路幅員係数', '0.1', '')}
        ${field('maxHeight', '概算高さ上限', '0.1', 'm')}
      </div>
      <details>
        <summary>任意形状敷地（GeoJSON / メートル座標）</summary>
        <p class="hint">Polygon または Feature を貼り付けると、面積はポリゴン、建物包絡は外接矩形で近似します。緯度経度は直接入力しないでください。</p>
        <textarea name="geojson" rows="5" placeholder='{"type":"Polygon","coordinates":[[[0,0],[20,0],[18,30],[0,28],[0,0]]]}'></textarea>
      </details>

      <div class="section-title"><span>02</span><h2>建物・住戸条件</h2></div>
      <div class="grid">
        ${field('floorHeight', '階高', '0.1', 'm')}
        ${field('frontSetback', '前面空地', '0.1', 'm')}
        ${field('rearSetback', '後退距離', '0.1', 'm')}
        ${field('sideSetback', '側面後退', '0.1', 'm')}
        ${field('commonAreaRatio', '共用部率', '1', '%')}
        ${field('targetUnitArea', '目標住戸面積', '0.1', '㎡')}
        ${field('corridorWidth', '共用廊下幅', '0.1', 'm')}
        ${field('stairWidth', '階段幅', '0.05', 'm')}
        ${field('stairRise', '階段蹴上', '0.01', 'm')}
        ${field('stairTread', '階段踏面', '0.01', 'm')}
      </div>
      <button type="submit" class="primary">ボリュームチェックを実行</button>
    </form>

    <section id="results" class="panel result-panel" aria-live="polite">
      <div class="empty-state"><strong>条件を入力して実行してください。</strong><span>面積・階数・戸数・法規チェック・概略図を表示します。</span></div>
    </section>
  </main>
  <footer>Apartment Volume Planner JP — preliminary feasibility only</footer>
`;

function parsePolygon(raw: string): Point[] | undefined {
  if (!raw.trim()) return undefined;
  const parsed = JSON.parse(raw) as { type?: string; coordinates?: unknown; geometry?: { type?: string; coordinates?: unknown } };
  const geometry = parsed.type === 'Feature' ? parsed.geometry : parsed;
  if (geometry?.type !== 'Polygon' || !Array.isArray(geometry.coordinates)) {
    throw new Error('GeoJSONはPolygonまたはPolygon Featureにしてください。');
  }
  const ring = geometry.coordinates[0];
  if (!Array.isArray(ring)) throw new Error('Polygonの外周座標が見つかりません。');
  const points = ring.map((coordinate) => {
    if (!Array.isArray(coordinate) || coordinate.length < 2) throw new Error('座標形式が不正です。');
    const x = Number(coordinate[0]);
    const y = Number(coordinate[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('座標は数値にしてください。');
    return { x, y };
  });
  return points.length >= 3 ? points : undefined;
}

function numberValue(data: FormData, key: keyof PlanInput): number {
  const value = Number(data.get(key));
  if (!Number.isFinite(value)) throw new Error(`${String(key)} の値が不正です。`);
  return value;
}

function metric(label: string, value: string, accent = false): string {
  return `<div class="metric${accent ? ' accent' : ''}"><span>${label}</span><strong>${value}</strong></div>`;
}

function render(input: PlanInput): void {
  const result = calculatePlan(input);
  const svg = createPlanSvg(input, result);
  const resultElement = document.querySelector<HTMLElement>('#results');
  if (!resultElement) return;
  resultElement.innerHTML = `
    <div class="section-title"><span>03</span><h2>概算結果</h2></div>
    <div class="metrics">
      ${metric('敷地面積', `${result.siteArea.toFixed(1)}㎡`)}
      ${metric('有効容積率', `${result.effectiveFar.toFixed(0)}%`)}
      ${metric('建築面積', `${result.footprintArea.toFixed(1)}㎡`)}
      ${metric('延床面積', `${result.grossFloorArea.toFixed(1)}㎡`, true)}
      ${metric('計画階数', `${result.plannedFloors}階 / 高さ上限${result.heightLimitedFloors}階`)}
      ${metric('想定戸数', `約${result.totalUnits}戸`, true)}
      ${metric('賃貸有効面積', `${result.netRentableArea.toFixed(1)}㎡`)}
      ${metric('基準階戸数', `約${result.unitsPerTypicalFloor}戸`)}
    </div>
    <div class="drawing-card">
      ${svg}
      <button id="download-svg" type="button" class="secondary">SVG図面を保存</button>
    </div>
    <div class="section-title compact"><span>04</span><h2>法規・要確認事項</h2></div>
    <div class="checks">
      ${result.checks.map((check) => `<article class="check ${check.status}"><div><b>${check.title}</b><span>${check.status.toUpperCase()}</span></div><p>${check.message}</p><small>${check.source}</small></article>`).join('')}
    </div>
    <div class="warnings">${result.warnings.map((warning) => `<p>※ ${warning}</p>`).join('')}</div>
  `;

  document.querySelector<HTMLButtonElement>('#download-svg')?.addEventListener('click', () => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'apartment-volume-plan.svg';
    anchor.click();
    URL.revokeObjectURL(url);
  });
}

document.querySelector<HTMLFormElement>('#planner-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  try {
    const input: PlanInput = {
      siteWidth: numberValue(data, 'siteWidth'),
      siteDepth: numberValue(data, 'siteDepth'),
      polygon: parsePolygon(String(data.get('geojson') ?? '')),
      frontageWidth: numberValue(data, 'frontageWidth'),
      roadWidth: numberValue(data, 'roadWidth'),
      designatedBcr: numberValue(data, 'designatedBcr'),
      designatedFar: numberValue(data, 'designatedFar'),
      roadFarCoefficient: numberValue(data, 'roadFarCoefficient'),
      maxHeight: numberValue(data, 'maxHeight'),
      floorHeight: numberValue(data, 'floorHeight'),
      frontSetback: numberValue(data, 'frontSetback'),
      rearSetback: numberValue(data, 'rearSetback'),
      sideSetback: numberValue(data, 'sideSetback'),
      commonAreaRatio: numberValue(data, 'commonAreaRatio'),
      targetUnitArea: numberValue(data, 'targetUnitArea'),
      corridorWidth: numberValue(data, 'corridorWidth'),
      stairWidth: numberValue(data, 'stairWidth'),
      stairRise: numberValue(data, 'stairRise'),
      stairTread: numberValue(data, 'stairTread')
    };
    render(input);
  } catch (error) {
    const resultElement = document.querySelector<HTMLElement>('#results');
    if (resultElement) resultElement.innerHTML = `<div class="error"><strong>入力エラー</strong><p>${error instanceof Error ? error.message : '不明なエラーです。'}</p></div>`;
  }
});

render(defaults);
