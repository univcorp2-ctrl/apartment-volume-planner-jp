import { boundingBox, clamp, polygonArea } from './geometry';
import { createBaselineChecks } from './rules';
import type { PlanInput, PlanResult } from './types';

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function calculatePlan(input: PlanInput): PlanResult {
  const polygonBox = input.polygon && input.polygon.length >= 3 ? boundingBox(input.polygon) : undefined;
  const siteWidth = positive(polygonBox?.width ?? input.siteWidth, input.siteWidth);
  const siteDepth = positive(polygonBox?.depth ?? input.siteDepth, input.siteDepth);
  const polygonSiteArea = input.polygon && input.polygon.length >= 3 ? polygonArea(input.polygon) : 0;
  const siteArea = positive(polygonSiteArea, siteWidth * siteDepth);

  const bcr = clamp(input.designatedBcr, 0, 100);
  const effectiveFar = Math.min(
    positive(input.designatedFar, 100),
    positive(input.roadWidth, 1) * positive(input.roadFarCoefficient, 0.4) * 100
  );

  const envelopeWidth = Math.max(0, siteWidth - Math.max(0, input.sideSetback) * 2);
  const envelopeDepth = Math.max(0, siteDepth - Math.max(0, input.frontSetback) - Math.max(0, input.rearSetback));
  const setbackEnvelopeArea = envelopeWidth * envelopeDepth;
  const bcrCap = siteArea * (bcr / 100);
  const footprintArea = Math.max(0, Math.min(siteArea, bcrCap, setbackEnvelopeArea));

  const heightLimitedFloors = Math.max(1, Math.floor(positive(input.maxHeight, 10) / positive(input.floorHeight, 3)));
  const farCap = siteArea * (effectiveFar / 100);
  const heightCap = footprintArea * heightLimitedFloors;
  const grossFloorArea = Math.max(0, Math.min(farCap, heightCap));
  const plannedFloors = footprintArea > 0
    ? Math.min(heightLimitedFloors, Math.max(1, Math.ceil(grossFloorArea / footprintArea)))
    : 0;

  const netRatio = 1 - clamp(input.commonAreaRatio, 0, 80) / 100;
  const netRentableArea = grossFloorArea * netRatio;
  const typicalNetFloor = footprintArea * netRatio;
  const targetUnitArea = positive(input.targetUnitArea, 25);
  const unitsPerTypicalFloor = footprintArea > 0 ? Math.max(0, Math.floor(typicalNetFloor / targetUnitArea)) : 0;
  const totalUnits = Math.max(0, Math.floor(netRentableArea / targetUnitArea));

  const warnings = [
    '本結果は事業初期の概算です。建築確認、構造設計、消防協議、行政協議を代替しません。',
    '斜線、日影、天空率、採光、避難距離、二方向避難、エレベーター、バリアフリー、設備シャフトは未実装です。',
    input.polygon ? '任意形状敷地は面積をポリゴンから算定し、建物包絡はバウンディングボックス近似です。' : '敷地は矩形として計算しています。'
  ];

  const partial: Omit<PlanResult, 'checks'> = {
    siteArea,
    siteWidth,
    siteDepth,
    effectiveFar,
    footprintArea,
    heightLimitedFloors,
    plannedFloors,
    grossFloorArea,
    netRentableArea,
    unitsPerTypicalFloor,
    totalUnits,
    warnings
  };

  return {
    ...partial,
    checks: createBaselineChecks(input, partial)
  };
}
