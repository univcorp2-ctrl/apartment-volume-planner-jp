import { describe, expect, it } from 'vitest';
import { calculatePlan } from '../src/domain/planner';
import type { PlanInput } from '../src/domain/types';

const base: PlanInput = {
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
  targetUnitArea: 40,
  corridorWidth: 1.2,
  stairWidth: 0.9,
  stairRise: 0.2,
  stairTread: 0.24
};

describe('calculatePlan', () => {
  it('calculates BCR, FAR, floors and unit count', () => {
    const result = calculatePlan(base);
    expect(result.siteArea).toBe(600);
    expect(result.footprintArea).toBe(360);
    expect(result.effectiveFar).toBe(200);
    expect(result.grossFloorArea).toBe(1200);
    expect(result.plannedFloors).toBe(4);
    expect(result.totalUnits).toBe(24);
  });

  it('applies the road-width FAR ceiling', () => {
    const result = calculatePlan({ ...base, designatedFar: 400, roadWidth: 4 });
    expect(result.effectiveFar).toBe(160);
    expect(result.grossFloorArea).toBe(960);
  });

  it('uses polygon area when supplied', () => {
    const result = calculatePlan({
      ...base,
      polygon: [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }]
    });
    expect(result.siteArea).toBe(400);
  });

  it('flags undersized stairs', () => {
    const result = calculatePlan({ ...base, stairWidth: 0.6 });
    expect(result.checks.find((check) => check.id === 'stairs')?.status).toBe('fail');
  });
});
