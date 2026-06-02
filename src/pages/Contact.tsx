const Contact = () => {
  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
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
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">이름 <span className="text-red-500">*</span></label>
                <input type="text" placeholder="성함을 입력해주세요" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">연락처 <span className="text-red-500">*</span></label>
                <input type="tel" placeholder="010-0000-0000" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">상담 희망 분야</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                <option value="">선택해주세요</option>
                <option value="상조">후불제 상조</option>
                <option value="병원">요양병원 연계</option>
                <option value="요양">방문요양서비스</option>
                <option value="기타">기타 문의</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">문의 내용</label>
              <textarea rows={5} placeholder="궁금하신 점을 남겨주시면 자세히 답변해 드리겠습니다." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md">
              문의 접수하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
