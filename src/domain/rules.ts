import type { ComplianceCheck, PlanInput, PlanResult } from './types';

export function createBaselineChecks(input: PlanInput, result: Omit<PlanResult, 'checks'>): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  checks.push({
    id: 'frontage',
    title: '接道長さ',
    status: input.frontageWidth >= 2 ? 'pass' : 'fail',
    message: input.frontageWidth >= 2
      ? `接道長さ ${input.frontageWidth.toFixed(2)}m を入力済みです。`
      : '一般的な接道要件の2mを下回っています。敷地・道路種別を要確認です。',
    source: '建築基準法 第43条（最終判断は特定行政庁・確認検査機関）'
  });

  checks.push({
    id: 'road-width',
    title: '前面道路幅員',
    status: input.roadWidth >= 4 ? 'pass' : 'review',
    message: input.roadWidth >= 4
      ? `道路幅員 ${input.roadWidth.toFixed(2)}m を容積率上限計算に使用しました。`
      : '4m未満のため、道路種別やセットバックの確認が必要です。',
    source: '建築基準法 第42条・第52条'
  });

  checks.push({
    id: 'stairs',
    title: '階段の基準寸法',
    status: input.stairWidth >= 0.75 && input.stairRise <= 0.23 && input.stairTread >= 0.15 ? 'pass' : 'fail',
    message: `幅 ${input.stairWidth.toFixed(2)}m、蹴上 ${input.stairRise.toFixed(2)}m、踏面 ${input.stairTread.toFixed(2)}m。用途・規模により、より厳しい寸法や複数直通階段が必要です。`,
    source: '建築基準法施行令 第23条ほか'
  });

  checks.push({
    id: 'corridor',
    title: '共用廊下幅',
    status: input.corridorWidth >= 1.2 ? 'pass' : 'review',
    message: input.corridorWidth >= 1.2
      ? `概略廊下幅 ${input.corridorWidth.toFixed(2)}m を確保しています。`
      : '初期計画値として1.2m未満です。住戸配置、片側・両側居室、床面積、自治体条例を確認してください。',
    source: '建築基準法施行令 第119条ほか'
  });

  checks.push({
    id: 'far',
    title: '有効容積率',
    status: result.effectiveFar < input.designatedFar ? 'review' : 'pass',
    message: `指定 ${input.designatedFar.toFixed(0)}% に対し、前面道路幅員制限を含む概算有効容積率は ${result.effectiveFar.toFixed(0)}% です。`,
    source: '建築基準法 第52条'
  });

  checks.push({
    id: 'local-ordinances',
    title: '自治体条例・地区計画',
    status: 'review',
    message: '窓先空地、ワンルーム、駐車・駐輪、緑化、高度地区、防火地域、地区計画等は所在地別ルールデータで別途判定が必要です。',
    source: '各自治体の条例・都市計画決定情報'
  });

  return checks;
}
