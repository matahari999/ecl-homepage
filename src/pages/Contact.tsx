import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { WEB3FORMS_ACCESS_KEY } from '../config';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const Contact = () => {
  const title = '상담 신청 | 고양·파주·김포 후불제상조 이음케어라이프';
  const description = '후불제상조·요양병원 연결·방문요양서비스 관련 상담을 24시간 무료로 신청하세요. 일산새마을금고 등 MOU 협약 회원 특별 혜택 안내.';
  const canonical = 'https://ecl.ai.kr/contact';
  const ogImage = 'https://ecl.ai.kr/logo.png';

  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' });
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[이음케어라이프 상담신청] ${form.name}님 - ${form.service || '분야 미선택'}`,
          from_name: '이음케어라이프 홈페이지',
          이름: form.name,
          연락처: form.phone,
          상담분야: form.service,
          문의내용: form.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', phone: '', service: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="상조상담,요양병원상담,방문요양상담,이음케어라이프,고양상담,일산상담,파주상담,김포상담" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">상담 신청</h1>
          <p className="text-slate-600">
            도움이 필요하신가요? 언제든 연락 주시면 친절하게 안내해 드리겠습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Phone Consult Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex justify-center items-center mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">전화 상담</h3>
            <p className="text-slate-500 mb-4">전문 상담사가 24시간 친절하게 답변해 드립니다.</p>
            <a href="tel:1588-9012" className="text-2xl font-black text-blue-600 hover:text-blue-800 transition-colors">
              1588-9012
            </a>
          </div>

          {/* Email/Online Consult Card */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex justify-center items-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">카카오톡 상담</h3>
            <p className="text-slate-500 mb-4">간편하게 카카오톡으로 문의사항을 남겨주세요.</p>
            <a href="https://pf.kakao.com/" target="_blank" rel="noopener noreferrer" className="bg-[#FEE500] text-[#3C1E1E] px-6 py-2 rounded-full font-bold hover:bg-[#FEE500]/90 transition-colors">
              카카오톡 채널 바로가기
            </a>
          </div>
          {/* Address card was removed here as per request */}
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">온라인 문의하기</h2>
            <p className="text-slate-500">아래 양식을 작성해 주시면 확인 후 신속하게 연락드리겠습니다.</p>
          </div>
          
          {status === 'success' ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">✅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">문의가 접수되었습니다</h3>
              <p className="text-slate-500">확인 후 빠르게 연락드리겠습니다.</p>
              <button onClick={() => setStatus('idle')} className="mt-6 text-blue-600 font-semibold hover:underline">다시 문의하기</button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">이름 <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="성함을 입력해주세요" required
                    value={form.name} onChange={e => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">연락처 <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="010-0000-0000" required
                    value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">상담 희망 분야</label>
                <select value={form.service} onChange={e => handleChange('service', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                  <option value="">선택해주세요</option>
                  <option value="상조">후불제 상조</option>
                  <option value="병원">요양병원 연계</option>
                  <option value="요양">방문요양서비스</option>
                  <option value="기타">기타 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">문의 내용</label>
                <textarea rows={5} placeholder="궁금하신 점을 남겨주시면 자세히 답변해 드리겠습니다."
                  value={form.message} onChange={e => handleChange('message', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
              </div>

              {status === 'error' && (
                <p className="text-red-600 text-sm font-semibold">전송에 실패했습니다. 전화(1588-9012)로 문의해 주시거나 잠시 후 다시 시도해 주세요.</p>
              )}

              <button type="submit" disabled={status === 'submitting'}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                {status === 'submitting' ? '전송 중...' : '문의 접수하기'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
