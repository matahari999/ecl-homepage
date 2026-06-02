import { useState, useCallback } from 'react';
import { Printer, RotateCcw, Calculator, CheckCircle2 } from 'lucide-react';

interface QuoteOption {
  value: string;
  price: number;
  special?: boolean;
}

interface QuoteCategory {
  emoji: string;
  label: string;
  dataLabel: string;
  description: string;
  options: QuoteOption[];
}

const QUOTE_CATEGORIES: QuoteCategory[] = [
  { emoji: '👔', label: '1. 상복/남 (추가)', dataLabel: '상복/남 추가', description: '기본 2벌 포함 · 넥타이/와이셔츠 별도',
    options: [{ value: '추가 없음', price: 0 }, { value: '1벌 추가', price: 30000 }, { value: '2벌 추가', price: 60000 }, { value: '3벌 추가', price: 90000 }, { value: '4벌 추가', price: 120000 }, { value: '5벌 추가', price: 150000 }] },
  { emoji: '🧥', label: '2. 상복/여 (추가)', dataLabel: '상복/여 추가', description: '기본 2벌 포함',
    options: [{ value: '추가 없음', price: 0 }, { value: '1벌 추가', price: 20000 }, { value: '2벌 추가', price: 40000 }, { value: '3벌 추가', price: 60000 }, { value: '4벌 추가', price: 80000 }, { value: '5벌 추가', price: 100000 }] },
  { emoji: '🍽️', label: '3. 도우미 (선택)', dataLabel: '도우미', description: '1인당 11만원(10시간)',
    options: [{ value: '미선택', price: 0 }, { value: '1명', price: 110000 }, { value: '2명', price: 220000 }, { value: '3명', price: 330000 }, { value: '4명', price: 440000 }, { value: '5명', price: 550000 }, { value: '6명', price: 660000 }] },
  { emoji: '⚰️', label: '4. 관 업그레이드 (선택)', dataLabel: '관 업그레이드', description: '기본 보통관 포함',
    options: [{ value: '보통관 (기본 포함)', price: 0 }, { value: '특관으로 변경', price: 100000 }, { value: '맞춤관으로 변경', price: 350000 }, { value: '매장관으로 변경', price: 0, special: true }] },
  { emoji: '🧵', label: '5. 수의 업그레이드 (선택)', dataLabel: '수의 업그레이드', description: '기본수의 포함',
    options: [{ value: '기본수의 (기본 포함)', price: 0 }, { value: '저대수의로 변경', price: 150000 }, { value: '대마수의로 변경', price: 250000 }, { value: '한지수의로 변경', price: 350000 }, { value: '종교수의로 변경', price: 350000 }, { value: '인견수의로 변경', price: 650000 }, { value: '매장수의로 변경', price: 0, special: true }] },
  { emoji: '🌸', label: '6. 고급서비스 (선택)', dataLabel: '고급서비스', description: '',
    options: [{ value: '미선택', price: 0 }, { value: '생화꽃관', price: 150000 }, { value: '궁중대렴', price: 250000 }, { value: '금장궁중대렴', price: 400000 }, { value: '생화꽃관 + 궁중대렴', price: 350000 }, { value: '생화꽃관 + 금장궁중대렴', price: 400000 }] },
  { emoji: '🚌', label: '7. 장의차량 업그레이드 (선택)', dataLabel: '장의차량 업그레이드', description: '기본 장의버스 포함',
    options: [{ value: '장의버스 (기본 포함)', price: 0 }, { value: '리무진으로 변경', price: 400000 }, { value: '리무진 + 장의버스', price: 400000 }] },
  { emoji: '👥', label: '8. 발인운구 (선택)', dataLabel: '발인운구', description: '',
    options: [{ value: '미선택', price: 0 }, { value: '2명', price: 200000 }, { value: '4명', price: 400000 }, { value: '6명', price: 600000 }] },
];

const BASE_PRICE = 990000;

const BASE_INCLUDES = [
  { category: '용품', items: ['보통관', '기본수의', '입관용품(관보·결관·염지·소독제·탈지면·다라니경·기독경·천주경)', '빈소용품(초·향·위패·명패·부의록·완장·상장핀)', '유골함(오동나무 목함)'] },
  { category: '상복', items: ['남자 2벌', '여자 2벌'] },
  { category: '인력 (3일)', items: ['장례지도사 1명', '입관지도사 1명'] },
  { category: '차량', items: ['장의버스'] },
  { category: '서비스', items: ['장례일정 컨설팅', '화장 예약', '장지 알선(납골당·수목장·잔디장·해양장)', '행정 절차 안내', '부고 문자 서비스', '서류 절차 지원'] },
];

function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const Quote = () => {
  const [selections, setSelections] = useState<number[]>(QUOTE_CATEGORIES.map(() => 0));
  const [showBaseDetails, setShowBaseDetails] = useState(false);

  const handleSelectionChange = useCallback((categoryIndex: number, optionIndex: number) => {
    setSelections(prev => { const next = [...prev]; next[categoryIndex] = optionIndex; return next; });
  }, []);

  const resetSelections = useCallback(() => {
    setSelections(QUOTE_CATEGORIES.map(() => 0));
  }, []);

  let totalPrice = BASE_PRICE;
  const pickedItems: { label: string; value: string; price: number; special?: boolean }[] = [];
  const specialItems: string[] = [];

  selections.forEach((optIdx, catIdx) => {
    const cat = QUOTE_CATEGORIES[catIdx];
    const opt = cat.options[optIdx];
    if (opt.price > 0 || opt.special) {
      totalPrice += opt.price;
      pickedItems.push({ label: cat.dataLabel, value: opt.value, price: opt.price, special: opt.special });
      if (opt.special) specialItems.push(`${cat.dataLabel} : ${opt.value}`);
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 py-10 px-4">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
            <Calculator className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">이음케어라이프 맞춤상조 견적내기</h1>
            <p className="text-slate-400 text-sm mt-1">기본 99만원 상품 구성 · 필요한 옵션을 추가로 선택하세요</p>
          </div>
        </div>

        {/* 기본 포함 항목 */}
        <div className="mb-6">
          <button onClick={() => setShowBaseDetails(!showBaseDetails)}
            className="w-full bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-5 text-left hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-400 text-xs font-black mb-1 uppercase tracking-[0.15em]">BASE PACKAGE · 99만원</div>
                <div className="text-white font-black text-lg">기본 포함 항목 확인하기</div>
                <div className="text-slate-400 text-sm mt-1">일반장례 · 무빈소장례 동일 구성 | 기본 상품으로도 장례는 충분합니다</div>
              </div>
              <div className="text-blue-400 text-2xl">{showBaseDetails ? '−' : '+'}</div>
            </div>
          </button>
          {showBaseDetails && (
            <div className="mt-3 bg-slate-900/60 border border-white/5 rounded-2xl p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BASE_INCLUDES.map((group, idx) => (
                <div key={idx}>
                  <div className="text-blue-400 text-xs font-black uppercase tracking-wider mb-3">{group.category}</div>
                  <ul className="space-y-1.5">
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: 옵션 선택 */}
          <div className="space-y-3">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 px-1">추가 옵션 선택</div>
            {QUOTE_CATEGORIES.map((cat, catIdx) => (
              <div key={catIdx} className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
                <div className="bg-slate-800/50 px-5 py-3 border-b border-white/5">
                  <span className="text-lg mr-2">{cat.emoji}</span>
                  <span className="text-white font-bold text-[15px]">{cat.label}</span>
                  {cat.description && <span className="text-slate-500 text-xs ml-2">- {cat.description}</span>}
                </div>
                <div className="px-5 py-4">
                  <select value={selections[catIdx]}
                    onChange={(e) => handleSelectionChange(catIdx, parseInt(e.target.value))}
                    className="w-full h-12 bg-slate-800/80 border border-white/10 rounded-xl px-4 text-white text-[15px] font-medium focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all">
                    {cat.options.map((opt, optIdx) => (
                      <option key={optIdx} value={optIdx}>
                        {opt.value} ({opt.special ? '별도문의' : opt.price === 0 ? '0원' : `+${numberWithCommas(opt.price)}원`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Right: 견적 확인 */}
          <div className="lg:sticky lg:top-[100px] self-start">
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 px-6 py-5 text-center border-b border-white/5">
                <h3 className="text-xl font-black text-white">견적 확인</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  기본 견적 기준금액은 <strong className="text-white">990,000원</strong>입니다.<br/>
                  선택 항목은 아래 요약에 즉시 반영됩니다.
                </p>
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 mb-6">
                  <div className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">합계 견적</div>
                  <div className="text-3xl md:text-4xl font-black text-white leading-tight">₩<span>{numberWithCommas(totalPrice)}</span></div>
                  <div className="text-slate-500 text-xs mt-2">(현금, 카드 동일함)</div>
                </div>
                <h4 className="text-white font-black text-base mb-3">선택 항목</h4>
                <ul className="border-t border-white/5">
                  <li className="flex justify-between items-center py-3 border-b border-white/5 text-sm">
                    <span className="text-slate-300 font-bold">기본 견적 (99만원 상품)</span>
                    <span className="text-slate-400 font-bold">990,000원</span>
                  </li>
                  {pickedItems.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-start gap-3 py-3 border-b border-white/5 text-sm">
                      <span className="text-slate-300 font-bold">{item.label}</span>
                      <span className="text-slate-400 font-bold text-right whitespace-nowrap">
                        {item.special ? item.value : `${item.value} / +${numberWithCommas(item.price)}원`}
                      </span>
                    </li>
                  ))}
                </ul>
                {pickedItems.length === 0 && <p className="text-slate-500 text-sm py-3">추가 선택 항목이 없습니다.</p>}
                {specialItems.length > 0 && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold leading-relaxed">
                    ※ 별도문의 항목 포함 : {specialItems.join(' / ')}
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-sm">
                    <Printer size={16} />인쇄
                  </button>
                  <button onClick={resetSelections}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-sm">
                    <RotateCcw size={16} />다시만들기
                  </button>
                </div>
                <div className="mt-4 bg-slate-800/40 border border-white/5 rounded-xl p-4">
                  <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                    <li className="pl-4 relative before:content-['○'] before:absolute before:left-0">99만원 기본 상품이며, 필요한 옵션은 추가 선택하셔서 금액 참조하시면 됩니다.</li>
                    <li className="pl-4 relative before:content-['○'] before:absolute before:left-0">고인 전용 리무진은 1차 장지(화장장, 매장지)까지만 운행합니다.</li>
                    <li className="pl-4 relative before:content-['○'] before:absolute before:left-0">기본 차량의 거리는 150km이며 추가 시, 1km당 ₩1,800 청구됩니다. (통행료 별도)</li>
                    <li className="pl-4 relative before:content-['○'] before:absolute before:left-0">넥타이, 와이셔츠, 양말, 벨트는 미제공입니다. (별도 판매)</li>
                    <li className="pl-4 relative before:content-['○'] before:absolute before:left-0">장례식장 음식, 매점, 시성사용료, 제단꽃, 헌화꽃은 별도입니다.</li>
                  </ul>
                </div>
                <a href="#consult-form" className="block mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-xl font-black transition-all text-sm">
                  24시간 무료 상담 신청하기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
