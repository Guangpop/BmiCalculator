import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Apple, Heart, Info, Scale, Ruler, User, ArrowRight, RefreshCcw, Loader2, Target, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AdviceObject {
  category: string;
  summary: string;
  diet: string[];
  exercise: string[];
  precautions: string[];
}

export default function App() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  
  const [targetWeight, setTargetWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('moderate');
  const [primaryGoal, setPrimaryGoal] = useState('maintain');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [bmi, setBmi] = useState<number | null>(null);
  const [advice, setAdvice] = useState<AdviceObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateBMI = async () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    if (!h || !w || h <= 0 || w <= 0) {
      setError('請輸入有效的身高與體重');
      return;
    }
    if (!a || a <= 0) {
      setError('請輸入有效的年齡');
      return;
    }

    setError(null);
    setLoading(true);

    const calculatedBmi = w / ((h / 100) * (h / 100));
    setBmi(calculatedBmi);

    const fitnessLevelMap: Record<string, string> = {
      sedentary: '幾乎不運動',
      light: '輕度活動',
      moderate: '中度活動',
      active: '高度活動',
    };

    const goalMap: Record<string, string> = {
      lose_weight: '減重',
      maintain: '維持現狀',
      gain_muscle: '增肌',
    };

    try {
      const prompt = `
        我是一位 ${a} 歲的 ${gender === 'male' ? '男性' : gender === 'female' ? '女性' : '人'}。
        我的身高是 ${h} 公分，體重是 ${w} 公斤，計算出的 BMI 為 ${calculatedBmi.toFixed(1)}。
        我的日常活動量是：${fitnessLevelMap[fitnessLevel]}。
        我的主要健康目標是：${goalMap[primaryGoal]}${targetWeight ? `，目標體重為 ${targetWeight} 公斤` : ''}。
        請根據這些數值與目標，給我一份詳細、溫馨且專業的健康建議。語氣要像是一位溫柔的家庭醫師。
        請以 JSON 格式回傳，包含以下欄位：
        - category: BMI 類別 (例如：體重過輕、健康體位、體重過重、輕度肥胖等)
        - summary: 一段溫暖的總結與鼓勵 (約 50-80 字)
        - diet: 3-5 點具體的飲食建議 (字串陣列)
        - exercise: 3-5 點具體的運動建議 (字串陣列)
        - precautions: 3-5 點日常注意事項 (字串陣列)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              summary: { type: Type.STRING },
              diet: { type: Type.ARRAY, items: { type: Type.STRING } },
              exercise: { type: Type.ARRAY, items: { type: Type.STRING } },
              precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["category", "summary", "diet", "exercise", "precautions"],
          },
        },
      });

      if (response.text) {
        setAdvice(JSON.parse(response.text));
      } else {
        setError('無法取得建議，請稍後再試。');
      }
    } catch (err) {
      console.error(err);
      setError('發生錯誤，請檢查網路連線或稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('female');
    setTargetWeight('');
    setFitnessLevel('moderate');
    setPrimaryGoal('maintain');
    setShowAdvanced(false);
    setBmi(null);
    setAdvice(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-bg)] text-[var(--color-warm-text)] font-sans selection:bg-[var(--color-warm-accent)] selection:text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-olive)] mb-4">
            知己健康 - BMI 計算機
          </h1>
          <p className="text-[var(--color-warm-muted)] text-lg max-w-xl mx-auto">
            了解自己的身體密碼，讓我們為您量身打造溫暖的健康指南。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className={`lg:col-span-${bmi ? '4' : '6 lg:col-start-4'} transition-all duration-500 ease-in-out`}>
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-warm-border)]">
              <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2 text-[var(--color-olive)]">
                <User className="w-6 h-6 text-[var(--color-warm-accent)]" />
                您的基本資料
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2">性別</label>
                    <div className="flex bg-[#f5f4f0] rounded-full p-1">
                      <button
                        onClick={() => setGender('female')}
                        className={`flex-1 py-2 text-sm rounded-full transition-colors ${gender === 'female' ? 'bg-white text-[var(--color-olive)] shadow-sm' : 'text-[var(--color-warm-muted)] hover:text-[var(--color-warm-text)]'}`}
                      >
                        女性
                      </button>
                      <button
                        onClick={() => setGender('male')}
                        className={`flex-1 py-2 text-sm rounded-full transition-colors ${gender === 'male' ? 'bg-white text-[var(--color-olive)] shadow-sm' : 'text-[var(--color-warm-muted)] hover:text-[var(--color-warm-text)]'}`}
                      >
                        男性
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                      年齡 <span className="text-xs">(歲)</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full bg-[#f5f4f0] border-transparent focus:bg-white focus:border-[var(--color-warm-accent)] focus:ring-2 focus:ring-[var(--color-warm-accent)]/20 rounded-2xl px-4 py-3 outline-none transition-all"
                      placeholder="例如: 30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                    <Ruler className="w-4 h-4" /> 身高 <span className="text-xs">(公分)</span>
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#f5f4f0] border-transparent focus:bg-white focus:border-[var(--color-warm-accent)] focus:ring-2 focus:ring-[var(--color-warm-accent)]/20 rounded-2xl px-4 py-3 outline-none transition-all text-lg"
                    placeholder="例如: 165"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                    <Scale className="w-4 h-4" /> 體重 <span className="text-xs">(公斤)</span>
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#f5f4f0] border-transparent focus:bg-white focus:border-[var(--color-warm-accent)] focus:ring-2 focus:ring-[var(--color-warm-accent)]/20 rounded-2xl px-4 py-3 outline-none transition-all text-lg"
                    placeholder="例如: 60"
                  />
                </div>

                <div className="h-px w-full bg-[var(--color-warm-border)] my-6"></div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xl font-serif font-semibold text-[var(--color-olive)] hover:opacity-80 transition-opacity"
                >
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[var(--color-warm-accent)]" />
                    專屬健康藍圖 <span className="text-sm font-sans font-normal text-[var(--color-warm-muted)] ml-1">(進階設定)</span>
                  </span>
                  {showAdvanced ? <ChevronUp className="w-5 h-5 text-[var(--color-warm-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-warm-muted)]" />}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 pt-6 pb-2">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                            主要目標
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'lose_weight', label: '減重' },
                              { id: 'maintain', label: '維持' },
                              { id: 'gain_muscle', label: '增肌' }
                            ].map(goal => (
                              <button
                                key={goal.id}
                                onClick={() => setPrimaryGoal(goal.id)}
                                className={`py-2 text-sm rounded-xl transition-colors ${primaryGoal === goal.id ? 'bg-[var(--color-olive)] text-white shadow-sm' : 'bg-[#f5f4f0] text-[var(--color-warm-muted)] hover:bg-[#e8e7e3]'}`}
                              >
                                {goal.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                              <Dumbbell className="w-4 h-4" /> 日常活動量
                            </label>
                            <div className="relative">
                              <select
                                value={fitnessLevel}
                                onChange={(e) => setFitnessLevel(e.target.value)}
                                className="w-full bg-[#f5f4f0] border-transparent focus:bg-white focus:border-[var(--color-warm-accent)] focus:ring-2 focus:ring-[var(--color-warm-accent)]/20 rounded-2xl px-4 py-3 outline-none transition-all appearance-none"
                              >
                                <option value="sedentary">幾乎不運動</option>
                                <option value="light">輕度活動</option>
                                <option value="moderate">中度活動</option>
                                <option value="active">高度活動</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--color-warm-muted)]">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-warm-muted)] mb-2 flex items-center gap-1">
                              目標體重 <span className="text-xs">(選填, 公斤)</span>
                            </label>
                            <input
                              type="number"
                              value={targetWeight}
                              onChange={(e) => setTargetWeight(e.target.value)}
                              className="w-full bg-[#f5f4f0] border-transparent focus:bg-white focus:border-[var(--color-warm-accent)] focus:ring-2 focus:ring-[var(--color-warm-accent)]/20 rounded-2xl px-4 py-3 outline-none transition-all"
                              placeholder="例如: 55"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm">
                    {error}
                  </motion.p>
                )}

                <div className="pt-4 space-y-3">
                  <button
                    onClick={calculateBMI}
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-[var(--color-olive)] text-white font-medium hover:bg-[#5a5e4d] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        正在為您分析...
                      </>
                    ) : (
                      <>
                        開始分析 <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  {bmi && (
                    <button
                      onClick={reset}
                      className="w-full py-4 rounded-full border-2 border-[var(--color-warm-border)] text-[var(--color-warm-muted)] font-medium hover:bg-[#f5f4f0] transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCcw className="w-5 h-5" />
                      重新計算
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <AnimatePresence>
            {bmi && advice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-8 space-y-6"
              >
                {/* BMI Score Card */}
                <div className="bg-[var(--color-olive)] text-white rounded-[32px] p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">您的 BMI 指數</p>
                      <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-6xl md:text-7xl font-serif font-bold">{bmi.toFixed(1)}</span>
                        <span className="text-2xl font-serif px-4 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                          {advice.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 max-w-md">
                      <p className="text-lg leading-relaxed text-white/90 font-serif italic">
                        "{advice.summary}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-warm-border)]">
                    <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2 text-[var(--color-warm-accent)]">
                      <Apple className="w-6 h-6" />
                      飲食建議
                    </h3>
                    <ul className="space-y-4">
                      {advice.diet.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warm-accent)] mt-2.5 flex-shrink-0"></span>
                          <span className="text-[var(--color-warm-text)] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-warm-border)]">
                    <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2 text-[var(--color-sage)]">
                      <Activity className="w-6 h-6" />
                      運動指南
                    </h3>
                    <ul className="space-y-4">
                      {advice.exercise.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] mt-2.5 flex-shrink-0"></span>
                          <span className="text-[var(--color-warm-text)] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--color-warm-border)] md:col-span-2">
                    <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2 text-[var(--color-olive)]">
                      <Heart className="w-6 h-6" />
                      日常貼心提醒
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advice.precautions.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 bg-[var(--color-warm-bg)] p-4 rounded-2xl border border-[var(--color-warm-border)]/50">
                          <Info className="w-5 h-5 text-[var(--color-olive)] mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--color-warm-text)] leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
