import type { PlanInput, PlanResult } from './types';

const format = (value: number): string => value.toFixed(1);

export function createPlanSvg(input: PlanInput, result: PlanResult): string {
  const canvasWidth = 760;
  const canvasHeight = 520;
  const margin = 56;
  const drawingWidth = canvasWidth - margin * 2;
  const drawingHeight = canvasHeight - margin * 2 - 36;
  const scale = Math.min(drawingWidth / result.siteWidth, drawingHeight / result.siteDepth);
  const siteW = result.siteWidth * scale;
  const siteH = result.siteDepth * scale;
  const siteX = (canvasWidth - siteW) / 2;
  const siteY = margin;

  const buildingX = siteX + Math.max(0, input.sideSetback) * scale;
  const buildingY = siteY + Math.max(0, input.rearSetback) * scale;
  const envelopeW = Math.max(0, result.siteWidth - input.sideSetback * 2) * scale;
  const envelopeH = Math.max(0, result.siteDepth - input.frontSetback - input.rearSetback) * scale;
  const envelopeArea = Math.max(1, (result.siteWidth - input.sideSetback * 2) * (result.siteDepth - input.frontSetback - input.rearSetback));
  const footprintRatio = Math.min(1, Math.sqrt(result.footprintArea / envelopeArea));
  const buildingW = envelopeW * footprintRatio;
  const buildingH = envelopeH * footprintRatio;
  const centeredBuildingX = buildingX + (envelopeW - buildingW) / 2;
  const centeredBuildingY = buildingY + (envelopeH - buildingH) / 2;

  const corridorH = Math.min(buildingH * 0.24, Math.max(12, input.corridorWidth * scale));
  const corridorY = centeredBuildingY + (buildingH - corridorH) / 2;
  const stairW = Math.min(buildingW * 0.22, Math.max(24, input.stairWidth * 3.2 * scale));
  const unitCount = Math.max(1, Math.min(8, result.unitsPerTypicalFloor));
  const topCount = Math.ceil(unitCount / 2);
  const bottomCount = Math.floor(unitCount / 2);
  const unitStartX = centeredBuildingX + stairW;
  const unitAreaW = Math.max(1, buildingW - stairW);
  const topUnitW = unitAreaW / Math.max(1, topCount);
  const bottomUnitW = unitAreaW / Math.max(1, bottomCount || 1);

  const units: string[] = [];
  for (let i = 0; i < topCount; i += 1) {
    units.push(`<rect x="${unitStartX + i * topUnitW}" y="${centeredBuildingY}" width="${topUnitW}" height="${Math.max(1, corridorY - centeredBuildingY)}" class="unit"/><text x="${unitStartX + i * topUnitW + topUnitW / 2}" y="${centeredBuildingY + Math.max(16, (corridorY - centeredBuildingY) / 2)}" class="unit-label">住戸 ${i + 1}</text>`);
  }
  for (let i = 0; i < bottomCount; i += 1) {
    const y = corridorY + corridorH;
    units.push(`<rect x="${unitStartX + i * bottomUnitW}" y="${y}" width="${bottomUnitW}" height="${Math.max(1, centeredBuildingY + buildingH - y)}" class="unit"/><text x="${unitStartX + i * bottomUnitW + bottomUnitW / 2}" y="${y + Math.max(16, (centeredBuildingY + buildingH - y) / 2)}" class="unit-label">住戸 ${topCount + i + 1}</text>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasWidth} ${canvasHeight}" role="img" aria-label="共同住宅概略平面図">
    <style>
      .site{fill:#f7f4ed;stroke:#1d342f;stroke-width:3}.setback{fill:none;stroke:#d77a45;stroke-width:2;stroke-dasharray:8 6}.building{fill:#dcebe5;stroke:#0f6b57;stroke-width:3}.corridor{fill:#fff5c9;stroke:#96761b;stroke-width:1.5}.stair{fill:#d9d4ee;stroke:#4e4385;stroke-width:2}.unit{fill:#ffffff;stroke:#6f8f86;stroke-width:1.2}.label{font:700 15px system-ui;fill:#1d342f}.small{font:12px system-ui;fill:#52645f}.unit-label{font:11px system-ui;fill:#27463e;text-anchor:middle}.road{fill:#4b5563}.road-label{font:700 14px system-ui;fill:#fff;text-anchor:middle}
    </style>
    <rect width="100%" height="100%" fill="#fbfcfa"/>
    <text x="30" y="30" class="label">概略平面 / ${result.plannedFloors}階・約${result.totalUnits}戸</text>
    <rect x="${siteX}" y="${siteY}" width="${siteW}" height="${siteH}" class="site"/>
    <rect x="${buildingX}" y="${buildingY}" width="${envelopeW}" height="${envelopeH}" class="setback"/>
    <rect x="${centeredBuildingX}" y="${centeredBuildingY}" width="${buildingW}" height="${buildingH}" class="building"/>
    <rect x="${centeredBuildingX}" y="${corridorY}" width="${buildingW}" height="${corridorH}" class="corridor"/>
    <text x="${centeredBuildingX + buildingW / 2}" y="${corridorY + corridorH / 2 + 4}" class="small" text-anchor="middle">共用廊下 ${format(input.corridorWidth)}m</text>
    <rect x="${centeredBuildingX}" y="${centeredBuildingY}" width="${stairW}" height="${buildingH}" class="stair"/>
    <text x="${centeredBuildingX + stairW / 2}" y="${centeredBuildingY + buildingH / 2}" class="small" text-anchor="middle">階段・コア</text>
    ${units.join('')}
    <rect x="${siteX}" y="${siteY + siteH + 8}" width="${siteW}" height="28" rx="4" class="road"/>
    <text x="${siteX + siteW / 2}" y="${siteY + siteH + 27}" class="road-label">前面道路 ${format(input.roadWidth)}m</text>
    <text x="${siteX}" y="${siteY - 12}" class="small">敷地 ${format(result.siteWidth)}m × ${format(result.siteDepth)}m / ${format(result.siteArea)}㎡</text>
    <text x="${siteX + siteW}" y="${siteY - 12}" class="small" text-anchor="end">建築面積 約${format(result.footprintArea)}㎡</text>
  </svg>`;
}
