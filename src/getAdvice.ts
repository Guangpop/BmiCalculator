export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3';
export type Gender = 'male' | 'female';
export type AgeGroup = 'teen' | 'young' | 'adult' | 'middle' | 'senior';
export type FitnessLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type GapLevel = 'far' | 'mid' | 'close';

export interface AdviceObject {
  category: string;
  summary: string;
  diet: string[];
  exercise: string[];
  precautions: string[];
}

type AdviceData = Record<string, AdviceObject>;

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese1';
  if (bmi < 40) return 'obese2';
  return 'obese3';
}

export function classifyAge(age: number): AgeGroup {
  if (age < 18) return 'teen';
  if (age < 30) return 'young';
  if (age < 50) return 'adult';
  if (age < 65) return 'middle';
  return 'senior';
}

export function classifyGap(currentWeight: number, targetWeight?: number): GapLevel {
  if (!targetWeight) return 'close';
  const diff = Math.abs(currentWeight - targetWeight);
  if (diff > 10) return 'far';
  if (diff >= 3) return 'mid';
  return 'close';
}

export function mapGoal(goal: string): Goal {
  switch (goal) {
    case 'lose_weight': return 'lose';
    case 'maintain': return 'maintain';
    case 'gain_muscle': return 'gain';
    default: return 'maintain';
  }
}

const loaders: Record<BmiCategory, () => Promise<AdviceData>> = {
  underweight: () => import('./data/underweight.json').then(m => m.default),
  normal: () => import('./data/normal.json').then(m => m.default),
  overweight: () => import('./data/overweight.json').then(m => m.default),
  obese1: () => import('./data/obese1.json').then(m => m.default),
  obese2: () => import('./data/obese2.json').then(m => m.default),
  obese3: () => import('./data/obese3.json').then(m => m.default),
};

const cache = new Map<BmiCategory, AdviceData>();

export async function getAdvice(params: {
  bmi: number;
  age: number;
  gender: string;
  fitnessLevel: string;
  goal: string;
  weight: number;
  targetWeight?: number;
}): Promise<AdviceObject> {
  const bmiCategory = classifyBmi(params.bmi);
  const ageGroup = classifyAge(params.age);
  const gender: Gender = params.gender === 'male' ? 'male' : 'female';
  const fitness = params.fitnessLevel as FitnessLevel;
  const goal = mapGoal(params.goal);
  const gap = classifyGap(params.weight, params.targetWeight);

  let data = cache.get(bmiCategory);
  if (!data) {
    data = await loaders[bmiCategory]();
    cache.set(bmiCategory, data);
  }

  const key = `${gender}_${ageGroup}_${fitness}_${goal}_${gap}`;
  const entry = data[key];

  if (!entry) {
    return {
      category: '健康體位',
      summary: '感謝您使用知己健康！請確認輸入的資料是否正確，我們會為您提供最適合的建議。',
      diet: ['均衡攝取六大類食物', '每日飲水至少 2000 毫升', '減少加工食品攝取', '多攝取新鮮蔬果', '注意三餐定時定量'],
      exercise: ['每週至少運動 150 分鐘', '選擇自己喜歡的運動', '運動前後記得暖身與收操', '循序漸進增加運動強度', '搭配有氧與肌力訓練'],
      precautions: ['保持充足睡眠 7-8 小時', '定期健康檢查', '保持心情愉悅', '避免久坐不動', '注意姿勢與體態'],
    };
  }

  return entry;
}
