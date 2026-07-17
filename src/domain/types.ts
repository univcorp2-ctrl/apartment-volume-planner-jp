export interface Point {
  x: number;
  y: number;
}

export interface PlanInput {
  siteWidth: number;
  siteDepth: number;
  polygon?: Point[];
  frontageWidth: number;
  roadWidth: number;
  designatedBcr: number;
  designatedFar: number;
  roadFarCoefficient: number;
  maxHeight: number;
  floorHeight: number;
  frontSetback: number;
  rearSetback: number;
  sideSetback: number;
  commonAreaRatio: number;
  targetUnitArea: number;
  corridorWidth: number;
  stairWidth: number;
  stairRise: number;
  stairTread: number;
}

export type CheckStatus = 'pass' | 'review' | 'fail';

export interface ComplianceCheck {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  source: string;
}

export interface PlanResult {
  siteArea: number;
  siteWidth: number;
  siteDepth: number;
  effectiveFar: number;
  footprintArea: number;
  heightLimitedFloors: number;
  plannedFloors: number;
  grossFloorArea: number;
  netRentableArea: number;
  unitsPerTypicalFloor: number;
  totalUnits: number;
  checks: ComplianceCheck[];
  warnings: string[];
}
