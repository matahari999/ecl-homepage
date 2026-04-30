const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: '김*호 님',
      service: '후불제 상조',
      content: '갑작스러운 아버님의 상에 경황이 없었는데, 새벽에 연락드렸음에도 바로 달려와 주시고 모든 절차를 내 가족처럼 꼼꼼히 챙겨주셔서 정말 큰 위로가 되었습니다. 비용도 처음에 안내받은 그대로라 부담이 덜했습니다.',
      date: '2025. 02. 15',
      rating: 5
    },
    {
      id: 2,
      name: '이*영 님',
      service: '요양병원 연계',
      content: '치매가 있으신 어머님을 모실 병원을 찾느라 막막했는데, 집에서 가깝고 시설 좋은 곳을 여러 군데 비교해서 추천해 주신 덕분에 안심하고 모실 수 있었습니다. 직접 방문해서 확인까지 시켜주시는 꼼꼼함에 감동했습니다.',
      date: '2025. 01. 22',
      rating: 5
    },
    {
      id: 3,
      name: '박*수 님',
      service: '방문요양서비스',
      content: '등급 신청하는 방법조차 몰랐는데 처음부터 끝까지 다 알아서 해주셨어요. 지금 오시는 요양보호사 선생님도 너무 친절하시고 부모님 말벗도 잘 되어주셔서 제가 마음 편히 직장생활을 할 수 있게 되었습니다.',
      date: '2024. 11. 08',
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 text-center">고객 후기</h1>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          제대군인이음케어라이프와 함께하신 가족분들의 진솔한 이야기를 들려드립니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {review.service}
                  </span>
                  <div className="flex text-yellow-400">
                    {'★'.repeat(review.rating)}
                  </div>
                </div>
                <span className="text-sm text-slate-400">{review.date}</span>
              </div>
              
              <p className="text-slate-700 mb-6 flex-grow leading-relaxed">
                "{review.content}"
              </p>
              
              <div className="pt-4 border-t border-slate-50 mt-auto">
                <span className="font-semibold text-slate-900">{review.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
